"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin as supabase, Property } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { useStaffAuth } from "@/lib/staff-auth";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Star, Eye, Search, Building, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/admin/PageHeader";

export default function StaffPropertiesPage() {
  const { staffProfile } = useStaffAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      setProperties(properties.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error deleting property:", error);
      alert("Failed to delete property");
    }
  }

  if (!staffProfile?.can_manage_properties) {
    return (
      <Card className="m-8">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have permission to manage properties.</p>
        </div>
      </Card>
    );
  }

  const filteredProperties = properties.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.property_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <PageHeader
        eyebrow="Listings"
        title="Properties"
        description={`${properties.length} ${properties.length === 1 ? "property" : "properties"} listed`}
        actions={
          <>
            <Button render={<Link href="/staff/properties/new" />}>
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </>
        }
      />

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
        <Input
          type="text"
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ padding: '1rem 0' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <Building className="w-12 h-12 mx-auto" style={{ color: 'var(--color-gray-300)' }} />
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '1rem' }}>
            {searchQuery ? 'No properties match your search.' : 'No properties found.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filteredProperties.map(property => (
            <Card
              key={property.id}
              className="p-0 overflow-hidden gap-0"
            >
              {/* Image */}
              <div style={{ position: 'relative', height: '180px', background: 'var(--color-gray-100)' }}>
                {property.images && property.images.length > 0 ? (
                  <Image
                    src={property.images[0]}
                    alt={property.title || 'Property'}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Building className="w-8 h-8" style={{ color: 'var(--color-gray-300)' }} />
                  </div>
                )}
                {property.featured && (
                  <Badge
                    className="absolute top-2 right-2 gap-1"
                    style={{ background: '#fbbf24', color: '#92400e' }}
                  >
                    <Star className="w-3 h-3" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: '0.25rem' }}>
                  {property.title}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>
                  {[property.address, property.city].filter(Boolean).join(', ')}
                </p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-blue-500)' }}>
                  {formatPrice(property.price)}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <Button
                    render={<Link href={`/properties/${property.id}`} target="_blank" />}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Button>
                  <Button
                    render={<Link href={`/staff/properties/${property.id}`} />}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[var(--color-blue-500)] text-[var(--color-blue-500)] hover:text-[var(--color-blue-500)]"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(property.id)}
                    className="border-[#fca5a5] text-[#dc2626] hover:text-[#dc2626] shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. All property data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
