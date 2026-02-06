"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import {
    Loader2, Search, User, ShieldCheck, Plus, Building2,
    BadgeCheck, MapPin, FileText, AlertTriangle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HospitalResult {
    id: string;
    user_id: string;
    hospital_name: string;
    license_number: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone_number: string;
    verification_status: 'pending' | 'verified' | 'rejected';
}

interface UserResult {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
    hospital_name?: string;
    hospital_id?: string;
}

const PERMISSION_LEVELS = [
    {
        value: "view_summary",
        label: "View Summary Only",
        description: "Can see basic health info, allergies, blood type. Best for general inquiries.",
        color: "text-gray-400",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/20"
    },
    {
        value: "view_records",
        label: "View All Records",
        description: "Full read access to all medical records, lab results, prescriptions. For regular doctors.",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20"
    },
    {
        value: "emergency_access",
        label: "Emergency Access",
        description: "Gets instant alerts during SOS. Can access critical data for emergency treatment.",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20"
    },
    {
        value: "full_access",
        label: "Full Access (Guardian)",
        description: "Complete control including adding records. For family members or primary physicians.",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20"
    }
];

export function GrantAccessDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { supabaseUser, fetchUserProfile } = useAppStore();
    const [searchType, setSearchType] = useState<'users' | 'hospitals'>('hospitals');
    const [searchQuery, setSearchQuery] = useState("");
    const [userResults, setUserResults] = useState<UserResult[]>([]);
    const [hospitalResults, setHospitalResults] = useState<HospitalResult[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<HospitalResult | UserResult | null>(null);
    const [entityType, setEntityType] = useState<'user' | 'hospital' | null>(null);
    const [permissionLevel, setPermissionLevel] = useState("view_records");
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setUserResults([]);
        setHospitalResults([]);

        try {
            if (searchType === 'users') {
                // Search users by email or name
                const { data: usersData, error } = await supabase
                    .from('users')
                    .select('id, full_name, email, avatar_url, role')
                    .or(`email.ilike.%${searchQuery}%, full_name.ilike.%${searchQuery}%`)
                    .neq('id', supabaseUser?.id || '')
                    .limit(10);

                if (error) throw error;
                
                // Fetch hospital affiliation for doctors
                const enrichedUsers = await Promise.all(
                    (usersData || []).map(async (user) => {
                        if (user.role === 'Doctor') {
                            const { data: doctorProfile } = await supabase
                                .from('doctor_profiles')
                                .select('hospital_id')
                                .eq('user_id', user.id)
                                .single();
                            
                            if (doctorProfile?.hospital_id) {
                                const { data: hospitalData } = await supabase
                                    .from('hospital_profiles')
                                    .select('hospital_name')
                                    .eq('id', doctorProfile.hospital_id)
                                    .single();
                                
                                return {
                                    ...user,
                                    hospital_name: hospitalData?.hospital_name,
                                    hospital_id: doctorProfile.hospital_id
                                };
                            }
                        }
                        return user;
                    })
                );
                
                setUserResults(enrichedUsers);
            } else {
                // Search hospitals by name
                const { data, error } = await supabase
                    .from('hospital_profiles')
                    .select('id, user_id, hospital_name, license_number, address, city, state, country, phone_number, verification_status')
                    .ilike('hospital_name', `%${searchQuery}%`)
                    .limit(10);

                if (error) throw error;
                setHospitalResults(data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    const selectUser = (user: UserResult) => {
        setSelectedEntity(user);
        setEntityType('user');
    };

    const selectHospital = (hospital: HospitalResult) => {
        setSelectedEntity(hospital);
        setEntityType('hospital');
    };

    const clearSelection = () => {
        setSelectedEntity(null);
        setEntityType(null);
    };

    const handleGrant = async () => {
        if (!supabaseUser || !selectedEntity) return;
        setIsLoading(true);

        try {
            const entityName = entityType === 'hospital'
                ? (selectedEntity as HospitalResult).hospital_name
                : ((selectedEntity as UserResult).full_name || (selectedEntity as UserResult).email);

            // Get the grantee user ID
            const granteeId = entityType === 'hospital' 
                ? (selectedEntity as HospitalResult).user_id 
                : (selectedEntity as UserResult).id;

            // Prepare insert data
            const insertData = {
                user_id: supabaseUser.id,
                grantee_id: granteeId,
                level: permissionLevel,
                entity_name: entityName,
                entity_address: granteeId,
                entity_type: entityType,
                granted_at: new Date().toISOString()
            };

            // 1. Grant Permission
            const { error: grantError } = await supabase
                .from('access_permissions')
                .insert(insertData);

            if (grantError) throw grantError;

            // 2. Send Notification - get the user_id to notify
            const notifyUserId = entityType === 'hospital' 
                ? (selectedEntity as HospitalResult).user_id 
                : (selectedEntity as UserResult).id;

            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: notifyUserId,
                    sender_id: supabaseUser.id,
                    type: 'permission_granted',
                    title: 'New Patient Access Granted',
                    message: `A patient has granted you "${PERMISSION_LEVELS.find(p => p.value === permissionLevel)?.label}" access to their medical records.`,
                    action_link: `/clinical/dashboard`
                });

            if (notifError) console.error("Notification failed:", notifError);

            toast.success(`Access granted to ${entityName}`);
            await fetchUserProfile();
            resetAndClose();
        } catch (error: unknown) {
            console.error(error);
            const errMsg = error instanceof Error ? error.message : "Unknown error";
            toast.error("Failed to grant access", { description: errMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const resetAndClose = () => {
        onClose();
        setSelectedEntity(null);
        setEntityType(null);
        setSearchQuery("");
        setUserResults([]);
        setHospitalResults([]);
        setPermissionLevel("view_records");
    };

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        <BadgeCheck className="w-3 h-3" /> Verified
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Pending
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Unverified
                    </span>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] bg-[#0A0A0A]/95 border-white/10 backdrop-blur-2xl text-white rounded-3xl p-6 flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Grant Access to Your Records</DialogTitle>
                    <p className="text-sm text-gray-400 mt-1">Search for hospitals or individuals to share your medical data with.</p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 py-4">
                    {/* Search Type Tabs */}
                    <Tabs value={searchType} onValueChange={(v) => { setSearchType(v as 'users' | 'hospitals'); clearSelection(); setUserResults([]); setHospitalResults([]); }}>
                        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-full">
                            <TabsTrigger
                                value="hospitals"
                                className="flex-1 data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black rounded-lg font-bold"
                            >
                                <Building2 className="w-4 h-4 mr-2" /> Hospitals
                            </TabsTrigger>
                            <TabsTrigger
                                value="users"
                                className="flex-1 data-[state=active]:bg-[#00BFFF] data-[state=active]:text-black rounded-lg font-bold"
                            >
                                <User className="w-4 h-4 mr-2" /> Individuals
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Search Input */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {searchType === 'hospitals' ? 'Search Hospitals by Name' : 'Search Users by Email or Name'}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder={searchType === 'hospitals' ? "e.g. General Hospital, St. Mary's..." : "e.g. john@example.com"}
                                className="bg-white/5 border-white/10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={isSearching} className="bg-white/10 hover:bg-white/20 rounded-xl">
                                {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Selected Entity Display */}
                    {selectedEntity && (
                        <div className="p-4 bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-2xl animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-[#00BFFF]/20 rounded-xl">
                                        {entityType === 'hospital' ? <Building2 className="w-6 h-6 text-[#00BFFF]" /> : <User className="w-6 h-6 text-[#00BFFF]" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">
                                            {entityType === 'hospital' ? (selectedEntity as HospitalResult).hospital_name : ((selectedEntity as UserResult).full_name || 'Unknown User')}
                                        </p>
                                        {entityType === 'hospital' ? (
                                            <div className="space-y-1 mt-2">
                                                {getVerificationBadge((selectedEntity as HospitalResult).verification_status)}
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                    <FileText className="w-3 h-3" /> License: {(selectedEntity as HospitalResult).license_number}
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {(selectedEntity as HospitalResult).city}, {(selectedEntity as HospitalResult).state}, {(selectedEntity as HospitalResult).country}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400">{(selectedEntity as UserResult).email}</p>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs hover:text-red-400">
                                    Change
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Hospital Search Results */}
                    {!selectedEntity && hospitalResults.length > 0 && searchType === 'hospitals' && (
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                            {hospitalResults.map((hospital) => (
                                <div
                                    key={hospital.id}
                                    onClick={() => selectHospital(hospital)}
                                    className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-[#00BFFF]/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                                <Building2 className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold">{hospital.hospital_name}</p>
                                                {getVerificationBadge(hospital.verification_status)}
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3 h-3" /> {hospital.city}, {hospital.state}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FileText className="w-3 h-3" /> {hospital.license_number}
                                                </p>
                                            </div>
                                        </div>
                                        <Plus className="w-5 h-5 text-[#00BFFF] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* User Search Results */}
                    {!selectedEntity && userResults.length > 0 && searchType === 'users' && (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {userResults.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => selectUser(user)}
                                    className="p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 hover:border-[#00BFFF]/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 border border-white/10">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <p className="font-bold text-sm">{user.full_name || 'Unnamed User'}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                                {user.hospital_name && (
                                                    <p className="text-xs text-blue-400 flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" /> {user.hospital_name}
                                                    </p>
                                                )}
                                                {user.role && (
                                                    <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-wider rounded-full">
                                                        {user.role}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Plus className="w-5 h-5 text-[#00BFFF] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!selectedEntity && searchQuery && !isSearching &&
                        ((searchType === 'hospitals' && hospitalResults.length === 0) ||
                            (searchType === 'users' && userResults.length === 0)) && (
                            <p className="text-center text-gray-500 text-sm italic py-6">
                                No {searchType} found matching &quot;{searchQuery}&quot;
                            </p>
                        )}

                    {/* Permission Level Selection */}
                    {selectedEntity && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Select Access Level</Label>
                            <div className="grid grid-cols-1 gap-3">
                                {PERMISSION_LEVELS.map((level) => (
                                    <div
                                        key={level.value}
                                        onClick={() => setPermissionLevel(level.value)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${permissionLevel === level.value
                                            ? `${level.bgColor} ${level.borderColor}`
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`font-bold ${permissionLevel === level.value ? level.color : 'text-white'}`}>
                                                    {level.label}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{level.description}</p>
                                            </div>
                                            {permissionLevel === level.value && (
                                                <ShieldCheck className={`w-5 h-5 ${level.color}`} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t border-white/10 mt-auto">
                    <Button variant="ghost" onClick={resetAndClose} disabled={isLoading}>Cancel</Button>
                    <Button
                        onClick={handleGrant}
                        disabled={!selectedEntity || isLoading}
                        className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-bold rounded-xl"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                        Grant Access
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
