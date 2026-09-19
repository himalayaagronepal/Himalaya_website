import SubHeroSection from "../components/SubHeroSection";
import NewsNoticesView, {
  type FeaturedItem,
  type NewsCard,
  type NoticeCard,
  type LangContent,
} from "../components/NewsNoticesView";
import connectToDatabase from "../../lib/mongodb";
import News from "../../models/News";
import Notice from "../../models/Notice";
import ContentSettings, { CONTENT_SETTINGS_DEFAULTS } from "../../models/ContentSettings";
import currentNotices from "../../lib/current-notices.json";

export const metadata = {
  title: "News and Notices",
  description:
    "Official news, announcements, tenders and notices from Himalaya Nepal Agriculture.",
};

// The dummy/live switch and the underlying content can change at any time from
// the admin, so always render the current state.
export const dynamic = "force-dynamic";

// Fallback cover used for published news that has no cover image set.
const FALLBACK_NEWS_IMAGE =
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200";

// Nepali labels for the coloured notice-type badge (badge colour stays keyed on
// the English type so the palette is consistent across both languages).
const NOTICE_TYPE_LABELS_NE: Record<string, string> = {
  Notice: "सूचना",
  Tender: "बोलपत्र",
  Vacancy: "रिक्त पद",
  Circular: "परिपत्र",
  Result: "नतिजा",
};

// ── Bundled bilingual dummy content (shown while a section's toggle is "on") ──
type BiFeatured = {
  image: string;
  date: string;
  href: string;
  en: { title: string; category: string; excerpt: string };
  ne: { title: string; category: string; excerpt: string };
};

const dummyFeatured: BiFeatured = {
  image:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200",
  date: "May 18, 2026",
  href: "#",
  en: {
    title: "Integrated Farming Model Lifts Smallholder Incomes Across 12 Districts",
    category: "Sustainability",
    excerpt:
      "By combining poultry, livestock, fishery and organic crops on a single landholding, our partner farmers are turning seasonal income into a resilient, year-round livelihood — with average household earnings up 38% in the first year.",
  },
  ne: {
    title: "एकीकृत कृषि मोडेलले १२ जिल्लाका साना किसानको आम्दानी बढायो",
    category: "दिगोपन",
    excerpt:
      "एउटै जग्गामा कुखुरा, पशुपालन, मत्स्यपालन र जैविक बाली मिलाएर हाम्रा सहकर्मी किसानहरूले मौसमी आम्दानीलाई वर्षभरि टिक्ने जीविकोपार्जनमा परिणत गरेका छन् — पहिलो वर्षमै औसत घरायसी आम्दानी ३८% ले बढेको छ।",
  },
};

const dummyNews: BiFeatured[] = [
  {
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=600",
    date: "May 5, 2026",
    href: "#",
    en: {
      title: "New Cold-Chain Hub Commissioned in Biratnagar to Cut Post-Harvest Losses",
      category: "Infrastructure",
      excerpt:
        "The state-of-the-art facility reduces post-harvest losses by up to 40% and supports year-round export operations across the eastern corridor.",
    },
    ne: {
      title: "बाली पछिको क्षति घटाउन विराटनगरमा नयाँ कोल्ड-चेन हब सञ्चालनमा",
      category: "पूर्वाधार",
      excerpt:
        "अत्याधुनिक संरचनाले बाली पछिको क्षति ४०% सम्म घटाउँछ र पूर्वी करिडोरभर वर्षभरि निर्यात सञ्चालनलाई सहयोग गर्छ।",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1589923188651-268a9765e432?auto=format&fit=crop&q=80&w=600",
    date: "April 22, 2026",
    href: "#",
    en: {
      title: "Partner Farms Earn Global Organic Certification for Export Markets",
      category: "Partnership",
      excerpt:
        "A new certification partnership opens doors to premium European and North American markets for large cardamom, orthodox tea and ginger.",
    },
    ne: {
      title: "सहकर्मी फार्महरूले निर्यात बजारका लागि विश्वव्यापी जैविक प्रमाणीकरण प्राप्त गरे",
      category: "साझेदारी",
      excerpt:
        "नयाँ प्रमाणीकरण साझेदारीले अलैँची, अर्थोडक्स चिया र अदुवाका लागि युरोप र उत्तर अमेरिकी प्रिमियम बजारको ढोका खोल्छ।",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600",
    date: "April 9, 2026",
    href: "#",
    en: {
      title: "Farmer Welfare Fund Disburses NPR 50M in Crop Insurance Payouts",
      category: "Community",
      excerpt:
        "Over 2,000 smallholder farmers received insurance payouts following unseasonal rainfall, safeguarding their livelihoods for the next season.",
    },
    ne: {
      title: "किसान कल्याण कोषले बाली बिमा बापत रू. ५ करोड वितरण गर्‍यो",
      category: "समुदाय",
      excerpt:
        "बेमौसमी वर्षापछि २,००० भन्दा बढी साना किसानले बिमा रकम पाए, जसले अर्को सिजनका लागि उनीहरूको जीविकोपार्जन सुरक्षित बनायो।",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&q=80&w=600",
    date: "March 28, 2026",
    href: "#",
    en: {
      title: "Company Wins National Innovation Award for Digital Traceability",
      category: "Awards",
      excerpt:
        "Recognised by the Ministry of Agriculture for pioneering digital logistics and farm-to-market traceability in Nepal's agri-export sector.",
    },
    ne: {
      title: "डिजिटल ट्रेसेबिलिटीका लागि कम्पनीले राष्ट्रिय नवप्रवर्तन पुरस्कार जित्यो",
      category: "पुरस्कार",
      excerpt:
        "नेपालको कृषि-निर्यात क्षेत्रमा डिजिटल लजिस्टिक्स र फार्म-देखि-बजार ट्रेसेबिलिटीमा अग्रसरताका लागि कृषि मन्त्रालयद्वारा सम्मानित।",
    },
  },
];

type BiNotice = {
  day: string;
  month: string;
  year: string;
  type: string;
  href: string;
  en: { title: string };
  ne: { title: string };
};

const bundledNotices: BiNotice[] = currentNotices.notices.map((notice) => {
  const date = new Date(notice.publishedAt);
  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" }),
    month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    year: String(date.getUTCFullYear()),
    type: notice.type,
    href: notice.fileUrl || "#",
    en: { title: notice.title },
    ne: { title: notice.titleNe || notice.title },
  };
});

function formatLongDate(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Build the English and Nepali content sets. Real admin content falls back to
// its English field when a Nepali translation is missing, so an article is
// never blank in Nepali mode.
async function getContent(): Promise<{ en: LangContent; ne: LangContent }> {
  let newsDummyEnabled = CONTENT_SETTINGS_DEFAULTS.newsDummyEnabled;
  let noticesDummyEnabled = CONTENT_SETTINGS_DEFAULTS.noticesDummyEnabled;

  // Default to the bundled dummy content for both languages.
  let featuredEn: FeaturedItem | null = toFeatured(dummyFeatured, "en");
  let featuredNe: FeaturedItem | null = toFeatured(dummyFeatured, "ne");
  let newsEn: NewsCard[] = dummyNews.map((d) => toFeatured(d, "en"));
  let newsNe: NewsCard[] = dummyNews.map((d) => toFeatured(d, "ne"));
  let noticesEn: NoticeCard[] = bundledNotices.map((d) => toNotice(d, "en"));
  let noticesNe: NoticeCard[] = bundledNotices.map((d) => toNotice(d, "ne"));

  try {
    await connectToDatabase();
    const settings = await ContentSettings.findOne({ singletonKey: "content" }).lean();
    if (settings && typeof settings.newsDummyEnabled === "boolean") newsDummyEnabled = settings.newsDummyEnabled;
    if (settings && typeof settings.noticesDummyEnabled === "boolean") noticesDummyEnabled = settings.noticesDummyEnabled;

    if (!newsDummyEnabled) {
      const docs = await News.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).lean();
      const mapLang = (lang: "en" | "ne"): NewsCard[] =>
        docs.map((n: any) => {
          const categoryKey = n.category || "";
          return {
            title: (lang === "ne" ? n.titleNe : "") || n.title,
            date: formatLongDate(n.publishedAt || n.createdAt),
            category: (lang === "ne" ? n.categoryNe : "") || n.category || "",
            categoryKey,
            excerpt: (lang === "ne" ? n.excerptNe : "") || n.excerpt || "",
            image: n.coverImage || FALLBACK_NEWS_IMAGE,
            href: `/news/${n.slug}`,
          };
        });
      const mappedEn = mapLang("en");
      const mappedNe = mapLang("ne");
      featuredEn = mappedEn[0] || null;
      newsEn = mappedEn.slice(1);
      featuredNe = mappedNe[0] || null;
      newsNe = mappedNe.slice(1);
    }

    if (!noticesDummyEnabled) {
      const docs = await Notice.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).lean();
      const mapLang = (lang: "en" | "ne"): NoticeCard[] =>
        docs.map((n: any) => {
          const d = new Date(n.publishedAt || n.createdAt);
          const type = n.type || "Notice";
          return {
            day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
            month: d.toLocaleDateString("en-US", { month: "short" }),
            year: String(d.getFullYear()),
            type,
            typeLabel: lang === "ne" ? NOTICE_TYPE_LABELS_NE[type] || type : type,
            title: (lang === "ne" ? n.titleNe : "") || n.title,
            href: n.fileUrl || "#",
          };
        });
      noticesEn = mapLang("en");
      noticesNe = mapLang("ne");
    }
  } catch (error) {
    console.error("Error loading news & notices content:", error);
  }

  return {
    en: { featured: featuredEn, news: newsEn, notices: noticesEn },
    ne: { featured: featuredNe, news: newsNe, notices: noticesNe },
  };
}

function toFeatured(d: BiFeatured, lang: "en" | "ne"): FeaturedItem {
  const text = d[lang];
  return {
    title: text.title,
    date: d.date,
    category: text.category,
    categoryKey: d.en.category, // colour keyed on the English category
    excerpt: text.excerpt,
    image: d.image,
    href: d.href,
  };
}

function toNotice(d: BiNotice, lang: "en" | "ne"): NoticeCard {
  return {
    day: d.day,
    month: d.month,
    year: d.year,
    type: d.type,
    typeLabel: lang === "ne" ? NOTICE_TYPE_LABELS_NE[d.type] || d.type : d.type,
    title: d[lang].title,
    href: d.href,
  };
}

export default async function NewsAndNoticesPage() {
  const { en, ne } = await getContent();

  return (
    <main className="bg-white text-slate-900 selection:bg-emerald-100">
      <SubHeroSection
        title="News & Notices"
        description="Official announcements, press releases, tenders and notices from Himalaya Nepal Agriculture."
        image="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=2400"
      />

      <NewsNoticesView en={en} ne={ne} />
    </main>
  );
}
