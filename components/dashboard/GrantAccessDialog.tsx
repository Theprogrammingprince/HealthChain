"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, Search, User, ShieldCheck, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GrantAccessDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { supabaseUser, fetchUserProfile } = useAppStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [permissionLevel, setPermissionLevel] = useState("view_records");
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);

        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, email, avatar_url')
                .ilike('email', `%${searchQuery}%`)
                .neq('id', supabaseUser?.id || '') // Don't show self
                .limit(5);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    const handleGrant = async () => {
        if (!supabaseUser || !selectedUser) return;
        setIsLoading(true);

        try {
            // 1. Grant Permission
            const { error: grantError } = await supabase
                .from('access_permissions')
                .insert({
                    user_id: supabaseUser.id,           // The Patient
                    grantee_id: selectedUser.id,        // The Receiver
                    level: permissionLevel,
                    entity_name: selectedUser.full_name || selectedUser.email,
                    entity_address: selectedUser.id, // Using ID as address for internal users
                    granted_at: new Date().toISOString()
                });

            if (grantError) throw grantError;

            // 2. Send Notification
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: selectedUser.id, // Recipient
                    sender_id: supabaseUser.id,
                    type: 'permission_granted',
                    title: 'Access Granted',
                    message: `${supabaseUser.email} has granted you ${permissionLevel.replace('_', ' ')} access to their medical records.`,
                    action_link: `/dashboard/records?patient=${supabaseUser.id}`
                });

            if (notifError) console.error("Notification failed:", notifError); // specific error log, don't block flow

            toast.success(`Access granted to ${selectedUser.full_name}`);
            await fetchUserProfile();
            onClose();
            setSelectedUser(null);
            setSearchQuery("");
            setSearchResults([]);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to grant access", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-[#0A0A0A]/95 border-white/10 backdrop-blur-2xl text-white rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Grant Access</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Search Section */}
                    <div className="space-y-2">
                        <Label>Search User</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search by email..."
                                className="bg-white/5 border-white/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={isSearching} className="bg-white/10 hover:bg-white/20">
                                {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Results / Selected User */}
                    {selectedUser ? (
                        <div className="p-4 bg-[#00BFFF]/10 border border-[#00BFFF]/20 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-white/10">
                                    <AvatarImage src={selectedUser.avatar_url} />
                                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-sm">{selectedUser.full_name}</p>
                                    <p className="text-xs text-gray-400">{selectedUser.email}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="text-xs hover:text-red-400">
                                Change
                            </Button>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {searchResults.map((user) => (
                                <div key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback><User className="w-3 h-3" /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{user.full_name || 'Unnamed User'}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                    <Plus className="w-4 h-4 text-[#00BFFF]" />
                                </div>
                            ))}
                        </div>
                    ) : searchQuery && !isSearching && (
                        <p className="text-center text-gray-500 text-sm italic">No users found.</p>
                    )}

                    {/* Permission Level */}
                    {selectedUser && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Access Level</Label>
                            <Select value={permissionLevel} onValueChange={setPermissionLevel}>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0A] border-white/10">
                                    <SelectItem value="view_records">View Records (Read Only)</SelectItem>
                                    <SelectItem value="emergency_override">Emergency Override (Full Access)</SelectItem>
                                    <SelectItem value="admin">Full Admin (Edit Capability)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-gray-500">
                                * The user will serve as a Guardian and receive alerts during emergencies.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button
                        onClick={handleGrant}
                        disabled={!selectedUser || isLoading}
                        className="bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-bold"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                        Grant Access
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
