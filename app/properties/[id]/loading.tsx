import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the detail page: dusk header, gallery over its edge, content + sidebar.
export default function PropertyDetailsLoading() {
  return (
    <>
      <Header />
      <main className="hlx-page pdx-page">
        <section className="plx-head pdx-head">
          <div className="container">
            <Skeleton className="h-4 w-28 mb-6 bg-white/10" />
            <Skeleton className="h-12 w-3/4 max-w-xl mb-4 bg-white/10" />
            <Skeleton className="h-5 w-1/2 max-w-sm bg-white/10" />
          </div>
        </section>
        <section className="pdx-gallery">
          <div className="container">
            <Skeleton className="h-[280px] md:h-[500px] w-full rounded-[1.25rem]" />
          </div>
        </section>
        <section className="pdx-body">
          <div className="container pdx-layout">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-full" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-[420px] w-full rounded-[1.25rem]" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
