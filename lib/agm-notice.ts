import currentNotices from "./current-notices.json";

export const AGM_NOTICE_ID = "first-annual-general-meeting-2083";

export const agmNotice = currentNotices.notices.find((notice) => notice.id === AGM_NOTICE_ID)!;

export const agmNews = {
  slug: AGM_NOTICE_ID,
  title: agmNotice.title,
  titleNe: agmNotice.titleNe,
  category: "Company Announcement",
  categoryNe: "कम्पनीको सूचना",
  excerpt: agmNotice.excerpt,
  excerptNe:
    "कम्पनीको प्रथम वार्षिक साधारण सभा २०८३ कार्तिक ७ गते, शनिबार बिहान ८:०० बजे बसेरा बुटिक होटल, बबरमहल, काठमाडौंमा हुनेछ। सभाको पोस्टर र पूर्ण आधिकारिक सूचना हेर्नुहोस्।",
  coverImage: agmNotice.previewImages[0],
  publishedAt: agmNotice.publishedAt,
  createdAt: agmNotice.publishedAt,
  contentHtml: `
    <p>Himalaya Nepal Krishi Company Ltd. has published the notice for its First Annual General Meeting.</p>
    <ul>
      <li><strong>Meeting date:</strong> Saturday, 2083 Kartik 07 (24 October 2026)</li>
      <li><strong>Time:</strong> 8:00 AM; shareholder attendance registration opens at 7:30 AM.</li>
      <li><strong>Venue:</strong> Basera Boutique Hotel, Babarmahal, Kathmandu</li>
      <li><strong>First publication:</strong> 2083/06/11 (27 September 2026)</li>
    </ul>
    <p><a href="/notices/agm-poster-2083.jpeg" target="_blank" rel="noopener noreferrer">Open full-resolution event poster</a></p>
    <p>Please read the complete Nepali notice linked below for the agenda, participation and proxy requirements.</p>
    <p><a href="/notices/agm-notice-2083.png" target="_blank" rel="noopener noreferrer">Open full-resolution notice</a> · <a href="/notices/agm-notice-2083.pdf" target="_blank" rel="noopener noreferrer">Download PDF</a></p>
    <p><a href="/notices/agm-notice-2083.docx" download>Download original Word document</a> · <a href="/notices/agm-notice-2083-original.jpeg" target="_blank" rel="noopener noreferrer">View original newspaper photograph</a></p>
  `,
  contentHtmlNe: `
    <p>हिमालय नेपाल कृषि कम्पनी लिमिटेडको प्रथम वार्षिक साधारण सभा सम्बन्धी सूचना।</p>
    <ul>
      <li><strong>सभा हुने मिति:</strong> २०८३ कार्तिक ७ गते, शनिबार (24 October 2026)</li>
      <li><strong>समय:</strong> बिहान ८:०० बजे। शेयरधनीहरूको उपस्थिति पुस्तिका बिहान ७:३० बजेदेखि खुला रहनेछ।</li>
      <li><strong>स्थान:</strong> बसेरा बुटिक होटल, बबरमहल, काठमाडौं</li>
      <li><strong>प्रथम पटक प्रकाशित मिति:</strong> २०८३/०६/११ (27 September 2026)</li>
    </ul>
    <p><a href="/notices/agm-poster-2083.jpeg" target="_blank" rel="noopener noreferrer">सभाको पोस्टर पूर्ण आकारमा हेर्नुहोस्</a></p>
    <p>सभाका प्रस्तावहरू, सहभागिता तथा प्रतिनिधि नियुक्ति सम्बन्धी विवरणका लागि तलको लिङ्कबाट पूर्ण सूचना पढ्नुहोस्।</p>
    <p><a href="/notices/agm-notice-2083.png" target="_blank" rel="noopener noreferrer">स्पष्ट सूचना खोल्नुहोस्</a> · <a href="/notices/agm-notice-2083.pdf" target="_blank" rel="noopener noreferrer">पीडीएफ डाउनलोड गर्नुहोस्</a></p>
    <p><a href="/notices/agm-notice-2083.docx" download>मूल वर्ड फाइल डाउनलोड गर्नुहोस्</a> · <a href="/notices/agm-notice-2083-original.jpeg" target="_blank" rel="noopener noreferrer">मूल पत्रिकाको फोटो हेर्नुहोस्</a></p>
  `,
};

export const agmNewsHref = `/news/${agmNews.slug}`;
