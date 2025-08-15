import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getProperties, Property } from "@/lib/supabase";

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        // Get a mix of featured and regular properties
        const allProperties = await getProperties();
        
        // If no properties returned (likely due to Supabase not being initialized), 
        // show empty state instead of error
        if (!allProperties || allProperties.length === 0) {
          setProperties([]);
          return;
        }
        
        const featuredProperties = allProperties.filter(p => p.featured);
        const regularProperties = allProperties.filter(p => !p.featured);
        
        // Take up to 2 featured and 2 regular properties
        const selectedProperties = [
          ...featuredProperties.slice(0, 2),
          ...regularProperties.slice(0, 2)
        ].slice(0, 4);
        
        setProperties(selectedProperties);
      } catch (error) {
        console.warn('Error fetching featured properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Properties
            </h2>
            {properties.length === 0 ? (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                No properties available. Please check your database connection.
              </p>
            ) : (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Loading properties...
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Discover our handpicked selection of premium properties and stays.
            </p>
          </div>
          <Button variant="outline" size="lg" className="mt-4 md:mt-0 transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
            View All Properties
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {properties.length > 0 ? properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              id={property.id}
              title={property.title}
              location={property.location}
              price={property.price}
              priceType={property.price_type}
              rating={property.rating}
              reviews={property.reviews}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={property.area}
              image={property.image}
              type={property.type}
              featured={property.featured}
              managedBy={property.managed_by}
              landlordName={property.landlord_name}
              landlordVerified={property.landlord_verified}
              agencyName={property.agency_name}
              agencyVerified={property.agency_verified}
            />
          )) : !loading && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                No featured properties available at the moment.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please ensure your database connection is properly configured.
              </p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gradient-card rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2 gradient-text">{properties.length * 25}+</div>
            <div className="text-muted-foreground">Properties Listed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2 gradient-text">2000+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2 gradient-text">150+</div>
            <div className="text-muted-foreground">Verified Hosts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2 gradient-text">4.8★</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;