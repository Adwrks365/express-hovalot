import Head from "next/head";
import { ArchivePaginatedPage } from "@/components/content/ArchivePaginatedPage";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getArchiveSeo, parseArchivePath } from "@/lib/archives";
import { getContractByPath } from "@/lib/content-registry";

const PUBLIC_PATH = "/author/guest_2020/page/2";

export default function AuthorGuestPage2() {
  const archive = parseArchivePath(PUBLIC_PATH)!;
  const seo = getArchiveSeo(archive);
  const contract = getContractByPath(`${PUBLIC_PATH}/`);

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        {seo.description ? <meta name="description" content={seo.description} /> : null}
        <link rel="canonical" href={contract?.expectedCanonical || seo.canonical} />
      </Head>
      <Header />
      <main id="main-content" className="pb-20 sm:pb-4">
        <ArchivePaginatedPage path={PUBLIC_PATH} />
      </main>
      <Footer />
    </>
  );
}
