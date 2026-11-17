import React, { useEffect, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Building2, Croissant, ExternalLink, Loader2, MapPin, Phone } from 'lucide-react';
import { SakerAgency } from '../config/brand';
import { useSiteData } from '../context/SiteDataContext';

export interface ResolvedAgencyPlace {
  agency: SakerAgency;
  placeId: string;
  displayName: string;
  formattedAddress: string;
  position: { lat: number; lng: number };
  googleMapsURI?: string;
}

const AGENCY_SEARCH_QUERIES: Record<string, string> = {
  'siege-akwa': 'Boulangerie Saker Akwa, Douala, Cameroun',
  akwa: 'Boulangerie Saker Akwa, Douala, Cameroun',
  makepe: 'Boulangerie Saker Makepe, Douala, Cameroun',
  deido: 'Boulangerie Saker Deido, Douala, Cameroun',
  bali: 'Boulangerie Saker Bali, Douala, Cameroun',
  pk10: 'Boulangerie Saker PK10, Douala, Cameroun',
  logbaba: 'Boulangerie Saker Logbaba, Douala, Cameroun',
  beedi: 'Boulangerie Saker Beedi, Douala, Cameroun',
  aeroport: 'Boulangerie Saker Aeroport, Douala, Cameroun',
};

interface AgenciesMapInnerProps {
  selectedAgencyId: string | null;
  onSelectAgency: (agencyId: string | null) => void;
  resolvedPlaces: Record<string, ResolvedAgencyPlace>;
  setResolvedPlaces: React.Dispatch<React.SetStateAction<Record<string, ResolvedAgencyPlace>>>;
  isLoadingPlaces: boolean;
  setIsLoadingPlaces: React.Dispatch<React.SetStateAction<boolean>>;
}

const AgenciesMapInner: React.FC<AgenciesMapInnerProps> = ({
  selectedAgencyId,
  onSelectAgency,
  resolvedPlaces,
  setResolvedPlaces,
  isLoadingPlaces,
  setIsLoadingPlaces,
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const { siteContent } = useSiteData();
  const agencies = siteContent.contactPage.agencies;

  // Resolve real agency coordinates dynamically via Places API (New) Place.searchByText
  useEffect(() => {
    if (!placesLib) return;
    let isCancelled = false;

    const resolveAgencies = async () => {
      setIsLoadingPlaces(true);
      const nextResolved: Record<string, ResolvedAgencyPlace> = {};

      // 1. Resolve Douala city center via Places API (New) so no coordinates are hardcoded
      try {
        const cityRes = await placesLib.Place.searchByText({
          textQuery: 'Douala, Cameroun',
          fields: ['id', 'location'],
          maxResultCount: 1,
        });
        const cityLoc = cityRes.places?.[0]?.location;
        if (cityLoc && map && !isCancelled) {
          map.setCenter({ lat: cityLoc.lat(), lng: cityLoc.lng() });
          map.setZoom(12);
        }
      } catch (err) {
        const msg = String(err);
        if (
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('QuotaExceededError') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }

      // 2. Resolve each Boulangerie SAKER agency in Douala via Places API (New)
      for (const agency of agencies) {
        if (isCancelled) break;
        const query = AGENCY_SEARCH_QUERIES[agency.id] || `${agency.name}, Douala, Cameroun`;
        try {
          const response = await placesLib.Place.searchByText({
            textQuery: query,
            fields: ['id', 'displayName', 'location', 'formattedAddress', 'googleMapsURI'],
            maxResultCount: 1,
          });
          const place = response.places?.[0];
          if (place && place.location) {
            nextResolved[agency.id] = {
              agency,
              placeId: place.id,
              displayName: place.displayName || agency.name,
              formattedAddress: place.formattedAddress || agency.district,
              position: {
                lat: place.location.lat(),
                lng: place.location.lng(),
              },
              googleMapsURI: place.googleMapsURI || undefined,
            };
          }
        } catch (err) {
          const msg = String(err);
          if (
            msg.includes('OVER_QUERY_LIMIT') ||
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.includes('QuotaExceededError') ||
            msg.includes('429')
          ) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
        }
      }

      if (!isCancelled) {
        setResolvedPlaces(nextResolved);
        setIsLoadingPlaces(false);
      }
    };

    resolveAgencies();

    return () => {
      isCancelled = true;
    };
  }, [placesLib, map, agencies, setResolvedPlaces, setIsLoadingPlaces]);

  // Pan map when user selects an agency from the list or marker
  useEffect(() => {
    if (!map || !selectedAgencyId) return;
    const resolved = resolvedPlaces[selectedAgencyId];
    if (resolved) {
      map.panTo(resolved.position);
      map.setZoom(14);
    }
  }, [map, selectedAgencyId, resolvedPlaces]);

  const selectedPlace = selectedAgencyId ? resolvedPlaces[selectedAgencyId] : null;

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] rounded-[16px] overflow-hidden border border-[#E6DEC8] bg-[#F5EFE6]">
      {isLoadingPlaces && (
        <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-white/95 border border-[#E6DEC8] shadow-xs flex items-center gap-2 text-xs font-semibold text-[#212529]">
          <Loader2 className="w-3.5 h-3.5 text-[#E31E24] animate-spin" aria-hidden="true" />
          <span>Localisation des agences SAKER à Douala...</span>
        </div>
      )}

      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={{ lat: 0, lng: 0 }}
        defaultZoom={2}
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        {Object.values(resolvedPlaces).map((item) => {
          const isSelected = selectedAgencyId === item.agency.id;
          const isHQ = Boolean(item.agency.isHeadquarters);
          return (
            <AdvancedMarker
              key={item.agency.id}
              position={item.position}
              title={item.agency.name}
              zIndex={isSelected ? 50 : isHQ ? 30 : 10}
              onClick={() => onSelectAgency(item.agency.id)}
            >
              {/* Marqueur personnalisé aux couleurs officielles Boulangerie SAKER */}
              <div
                className={`group flex flex-col items-center cursor-pointer transition-transform duration-150 ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`px-2.5 py-1 rounded-full border-2 shadow-md flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#2A1810] text-white border-[#F5B316]'
                      : isHQ
                      ? 'bg-[#E31E24] text-white border-[#F5B316]'
                      : 'bg-white text-[#212529] border-[#E31E24]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected || isHQ
                        ? 'bg-[#F5B316] text-[#2A1810]'
                        : 'bg-[#E31E24] text-white'
                    }`}
                  >
                    {isHQ ? (
                      <Building2 className="w-3 h-3" aria-hidden="true" />
                    ) : (
                      <Croissant className="w-3 h-3" aria-hidden="true" />
                    )}
                  </span>
                  <span className="text-[11px] font-bold tracking-tight">
                    {item.agency.district.replace(', Douala', '')}
                  </span>
                </div>
                <div
                  className={`w-2.5 h-2.5 rotate-45 -mt-1 border-r-2 border-b-2 ${
                    isSelected
                      ? 'bg-[#2A1810] border-[#F5B316]'
                      : isHQ
                      ? 'bg-[#E31E24] border-[#F5B316]'
                      : 'bg-white border-[#E31E24]'
                  }`}
                />
              </div>
            </AdvancedMarker>
          );
        })}

        {selectedPlace && (
          <InfoWindow
            position={selectedPlace.position}
            maxWidth={290}
            onCloseClick={() => onSelectAgency(null)}
          >
            <div className="p-1 space-y-2 text-[#212529] font-sans">
              <div>
                <p className="text-[10px] font-bold text-[#E31E24] uppercase tracking-wider">
                  {selectedPlace.agency.isHeadquarters
                    ? 'Siège social & Salle de fête'
                    : 'Agence Boulangerie SAKER'}
                </p>
                <h3 className="text-sm font-bold text-[#212529] leading-snug">
                  {selectedPlace.agency.name}
                </h3>
                <p className="text-xs text-[#5C534C] mt-0.5">
                  {selectedPlace.formattedAddress}
                </p>
              </div>

              <div className="pt-1.5 border-t border-[#EFE9DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                <a
                  href={`tel:${selectedPlace.agency.phoneClean}`}
                  className="inline-flex items-center gap-1 font-bold text-[#E31E24] hover:underline tabular-price"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{selectedPlace.agency.phone}</span>
                </a>

                {selectedPlace.googleMapsURI && (
                  <a
                    href={selectedPlace.googleMapsURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#212529] hover:text-[#E31E24] underline underline-offset-2"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

interface AgenciesMapSectionProps {
  selectedAgencyId: string | null;
  onSelectAgency: (agencyId: string | null) => void;
}

export const AgenciesMapSection: React.FC<AgenciesMapSectionProps> = ({
  selectedAgencyId,
  onSelectAgency,
}) => {
  const { siteContent } = useSiteData();
  const agencies = siteContent.contactPage.agencies;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [resolvedPlaces, setResolvedPlaces] = useState<Record<string, ResolvedAgencyPlace>>({});
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);

  if (!apiKey) {
    return (
      <div className="p-6 rounded-[16px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs text-[#5C534C]">
        La clé API Google Maps Platform (<span className="font-mono">VITE_GOOGLE_MAPS_API_KEY</span>)
        n’est pas configurée dans cet environnement.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} language="fr" region="CM">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Carte interactive avec marqueurs personnalisés SAKER */}
        <div className="lg:col-span-7 xl:col-span-8">
          <AgenciesMapInner
            selectedAgencyId={selectedAgencyId}
            onSelectAgency={onSelectAgency}
            resolvedPlaces={resolvedPlaces}
            setResolvedPlaces={setResolvedPlaces}
            isLoadingPlaces={isLoadingPlaces}
            setIsLoadingPlaces={setIsLoadingPlaces}
          />
        </div>

        {/* Sélecteur interactif des agences synchronisé avec la carte */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[16px] border border-[#E6DEC8] p-4 flex flex-col h-[380px] sm:h-[460px] lg:h-[520px]">
          <div className="pb-3 border-b border-[#EFE9DC] shrink-0">
            <h3 className="text-sm font-bold text-[#212529] font-sans">
              Sélectionner une agence sur la carte
            </h3>
            <p className="text-[11px] text-[#5C534C] mt-0.5">
              Cliquez sur une unité pour centrer la carte et afficher ses coordonnées.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#EFE9DC] pr-1 mt-2">
            {agencies.map((agency) => {
              const isSelected = selectedAgencyId === agency.id;
              const resolved = resolvedPlaces[agency.id];
              return (
                <div
                  key={agency.id}
                  className={`py-3 px-2.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-[#FFF4F6]' : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectAgency(agency.id)}
                    className="w-full text-left space-y-1 focus:outline-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#212529] flex items-center gap-1.5">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-[#E31E24]' : 'text-[#868E96]'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{agency.name}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5C534C] pl-5">
                      {resolved ? resolved.formattedAddress : agency.district}
                    </p>
                  </button>

                  <div className="mt-2 pl-5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#212529] tabular-price">
                      {agency.phone}
                    </span>
                    <a
                      href={`tel:${agency.phoneClean}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E31E24] hover:bg-[#C8161C] text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
                    >
                      <Phone className="w-3 h-3" aria-hidden="true" />
                      <span>Appeler</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </APIProvider>
  );
};
