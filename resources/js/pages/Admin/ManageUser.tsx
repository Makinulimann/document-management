import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage User',
        href: '/manage-user',
    },
];

interface User {
    id: string;
    name: string;
    email: string;
    role_name: string;
    role_id: string;
    email_verified_at: string | null;
    created_at: string;
}

interface Role {
    role_id: string;
    role_name: string;
}

interface Props {
    users: {
        data: User[];
        links: any[];
    };
    roles: Role[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ManageUser() {
    const { props } = usePage<Props>();
    const { users, roles, flash } = props;
    const { delete: deleteRequest, post, put, processing } = useForm();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [updatingRoles, setUpdatingRoles] = useState<string[]>([]);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setNotification({ type: 'success', message: flash.success });
            setTimeout(() => setNotification(null), 5000);
        }
        if (flash?.error) {
            setNotification({ type: 'error', message: flash.error });
            setTimeout(() => setNotification(null), 5000);
        }
    }, [flash]);

    const handleSelectUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleDelete = (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            deleteRequest(route('manage-user.destroy', userId), {
                onSuccess: () => {
                    setNotification({ type: 'success', message: 'User deleted successfully' });
                    setTimeout(() => setNotification(null), 5000);
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    setNotification({ type: 'error', message: 'Failed to delete user' });
                    setTimeout(() => setNotification(null), 5000);
                },
            });
        }
    };

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) {
            setNotification({ type: 'error', message: 'Please select at least one user to delete' });
            setTimeout(() => setNotification(null), 5000);
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
            // Send bulk delete request instead of multiple individual requests
            post(route('manage-user.bulk-delete'), {
                user_ids: selectedUsers
            }, {
                onSuccess: () => {
                    setSelectedUsers([]);
                    setNotification({ type: 'success', message: `${selectedUsers.length} user(s) deleted successfully` });
                    setTimeout(() => setNotification(null), 5000);
                },
                onError: (errors) => {
                    console.error('Bulk delete failed:', errors);
                    setNotification({ type: 'error', message: 'Failed to delete some users' });
                    setTimeout(() => setNotification(null), 5000);
                },
            });
        }
    };

    const handleVerify = (userId: string) => {
        post(route('manage-user.verify', userId), {}, {
            onSuccess: () => {
                setNotification({ type: 'success', message: 'User verified successfully' });
                setTimeout(() => setNotification(null), 5000);
            },
            onError: (errors) => {
                console.error('Verify failed:', errors);
                setNotification({ type: 'error', message: 'Failed to verify user' });
                setTimeout(() => setNotification(null), 5000);
            },
        });
    };

    const handleUpdateRole = (userId: string, roleId: string) => {
        // Add user to updating list
        setUpdatingRoles(prev => [...prev, userId]);
        
        put(route('manage-user.update', userId), {
            role_id: roleId,
        }, {
            onSuccess: () => {
                setUpdatingRoles(prev => prev.filter(id => id !== userId));
                setNotification({ type: 'success', message: 'Role updated successfully' });
                setTimeout(() => setNotification(null), 5000);
            },
            onError: (errors) => {
                setUpdatingRoles(prev => prev.filter(id => id !== userId));
                console.error('Role update failed:', errors);
                setNotification({ type: 'error', message: 'Failed to update role' });
                setTimeout(() => setNotification(null), 5000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="relative p-6">
                        {/* Notification */}
                        {notification && (
                            <Alert className={`mb-4 ${notification.type === 'error' ? 'border-red-500 bg-red-50 text-red-700' : 'border-green-500 bg-green-50 text-green-700'}`}>
                                <AlertDescription>
                                    {notification.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Manage Users</h1>
                            {selectedUsers.length > 0 && (
                                <Button 
                                    variant="destructive" 
                                    onClick={handleBulkDelete} 
                                    disabled={processing}
                                >
                                    Delete Selected ({selectedUsers.length})
                                </Button>
                            )}
                        </div>

                        {/* Users Table */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={selectedUsers.length === users.data.length && users.data.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedUsers(users.data.map((user) => user.id));
                                                } else {
                                                    setSelectedUsers([]);
                                                }
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Email Verified At</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={() => handleSelectUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role_id}
                                                onValueChange={(value) => handleUpdateRole(user.id, value)}
                                                disabled={processing || updatingRoles.includes(user.id)}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select Role">
                                                        {updatingRoles.includes(user.id) ? 'Updating...' : user.role_name}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.role_id} value={role.role_id}>
                                                            {role.role_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>{user.created_at}</TableCell>
                                        <TableCell>{user.email_verified_at || 'Not Verified'}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {!user.email_verified_at && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleVerify(user.id)}
                                                        disabled={processing}
                                                    >
                                                        Verify
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={processing}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-end">
                            {users.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    className="mx-1"
                                    disabled={!link.url || processing}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}