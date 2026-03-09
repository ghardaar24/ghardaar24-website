"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin as supabase, Property } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { useStaffAuth } from "@/lib/staff-auth";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Star, Eye, Search, Building } from "lucide-react";

export default function StaffPropertiesPage() {
  const { staffProfile } = useStaffAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!staffProfile?.can_manage_properties) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#991b1b' }}>Access Denied</h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>You do not have permission to manage properties.</p>
      </div>
    );
  }

  const filteredProperties = properties.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.property_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Properties</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {properties.length} total properties
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '2.5rem',
            paddingRight: '1rem',
            paddingTop: '0.625rem',
            paddingBottom: '0.625rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="staff-loading-spinner" />
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '1rem' }}>Loading properties...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <Building className="w-12 h-12 mx-auto" style={{ color: '#d1d5db' }} />
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '1rem' }}>
            {searchQuery ? 'No properties match your search.' : 'No properties found.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filteredProperties.map(property => (
            <div
              key={property.id}
              style={{
                background: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: '180px', background: '#f3f4f6' }}>
                {property.images && property.images.length > 0 ? (
                  <Image
                    src={property.images[0]}
                    alt={property.title || 'Property'}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Building className="w-8 h-8" style={{ color: '#d1d5db' }} />
                  </div>
                )}
                {property.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: '#fbbf24',
                    color: '#92400e',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    <Star className="w-3 h-3" />
                    Featured
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                  {property.title}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  {[property.address, property.city].filter(Boolean).join(', ')}
                </p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#3b82f6' }}>
                  {formatPrice(property.price)}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <Link
                    href={`/properties/${property.id}`}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#374151',
                      textDecoration: 'none',
                      background: 'white',
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                  <Link
                    href={`/admin/properties/${property.id}`}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem',
                      border: '1px solid #3b82f6',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#3b82f6',
                      textDecoration: 'none',
                      background: 'white',
                    }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
