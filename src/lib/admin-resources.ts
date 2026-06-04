export type FieldType = "text" | "textarea" | "richtext" | "number" | "boolean" | "date" | "select" | "tags" | "json" | "image";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  optionsFrom?: {
    table: string;
    valueColumn: string;
    labelColumn: string;
    orderBy?: { column: string; ascending: boolean };
  };
}

export interface ResourceDef {
  table: string;
  title: string;
  singular: string;
  pk?: string;
  listColumns: { key: string; label: string }[];
  fields: FieldDef[];
  orderBy?: { column: string; ascending: boolean };
  searchColumn?: string;
  filter?: { column: string; value: string | number | boolean };
  defaults?: Record<string, unknown>;
}

export const resources: Record<string, ResourceDef> = {
  articles: {
    table: "articles",
    title: "আর্টিকেল",
    singular: "আর্টিকেল",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "title",
    listColumns: [
      { key: "title", label: "শিরোনাম" },
      { key: "article_type", label: "ধরন" },
      { key: "is_published", label: "প্রকাশিত" },
      { key: "views", label: "ভিউ" },
    ],
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "excerpt", label: "সংক্ষিপ্ত", type: "textarea" },
      { key: "content", label: "কন্টেন্ট", type: "richtext", required: true },
      { key: "cover_image", label: "কভার ছবি URL", type: "text" },
      { key: "audio_url", label: "অডিও URL", type: "text" },
      {
        key: "article_type",
        label: "ধরন",
        type: "select",
        options: [
          { value: "encyclopedia", label: "Encyclopedia" },
          { value: "blog", label: "Blog" },
          { value: "news", label: "News" },
        ],
      },
      {
        key: "category_id",
        label: "ক্যাটাগরি",
        type: "select",
        optionsFrom: { table: "categories", valueColumn: "id", labelColumn: "title", orderBy: { column: "sort_order", ascending: true } },
      },
      { key: "tags", label: "ট্যাগ (কমা দিয়ে)", type: "tags" },
      { key: "meta_title", label: "Meta Title", type: "text" },
      { key: "meta_description", label: "Meta Description", type: "textarea" },
      { key: "is_published", label: "প্রকাশিত", type: "boolean" },
    ],
  },
  news: {
    table: "articles",
    title: "স্বাস্থ্য সংবাদ",
    singular: "সংবাদ",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "title",
    filter: { column: "article_type", value: "news" },
    defaults: { article_type: "news" },
    listColumns: [
      { key: "title", label: "শিরোনাম" },
      { key: "is_published", label: "প্রকাশিত" },
      { key: "views", label: "ভিউ" },
    ],
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "excerpt", label: "সংক্ষিপ্ত", type: "textarea" },
      { key: "content", label: "কন্টেন্ট", type: "richtext", required: true },
      { key: "cover_image", label: "কভার ছবি URL", type: "text" },
      {
        key: "category_id",
        label: "স্বাস্থ্য বিভাগ",
        type: "select",
        optionsFrom: { table: "categories", valueColumn: "id", labelColumn: "title", orderBy: { column: "sort_order", ascending: true } },
      },
      { key: "tags", label: "ট্যাগ (কমা দিয়ে)", type: "tags" },
      { key: "meta_title", label: "Meta Title", type: "text" },
      { key: "meta_description", label: "Meta Description", type: "textarea" },
      { key: "is_published", label: "প্রকাশিত", type: "boolean" },
    ],
  },
  encyclopedia: {
    table: "articles",
    title: "স্বাস্থ্যকোষ (Encyclopedia)",
    singular: "এন্ট্রি",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "title",
    filter: { column: "article_type", value: "encyclopedia" },
    defaults: { article_type: "encyclopedia" },
    listColumns: [
      { key: "title", label: "শিরোনাম" },
      { key: "is_published", label: "প্রকাশিত" },
      { key: "views", label: "ভিউ" },
    ],
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "excerpt", label: "সংক্ষিপ্ত", type: "textarea" },
      { key: "content", label: "কন্টেন্ট", type: "richtext", required: true },
      { key: "cover_image", label: "কভার ছবি URL", type: "text" },
      { key: "audio_url", label: "অডিও URL", type: "text" },
      {
        key: "category_id",
        label: "স্বাস্থ্য বিভাগ",
        type: "select",
        optionsFrom: { table: "categories", valueColumn: "id", labelColumn: "title", orderBy: { column: "sort_order", ascending: true } },
      },
      { key: "tags", label: "ট্যাগ (কমা দিয়ে)", type: "tags" },
      { key: "meta_title", label: "Meta Title", type: "text" },
      { key: "meta_description", label: "Meta Description", type: "textarea" },
      { key: "is_published", label: "প্রকাশিত", type: "boolean" },
    ],
  },
  categories: {
    table: "categories",
    title: "ক্যাটাগরি",
    singular: "ক্যাটাগরি",
    orderBy: { column: "sort_order", ascending: true },
    searchColumn: "title",
    listColumns: [
      { key: "title", label: "নাম" },
      { key: "slug", label: "Slug" },
      { key: "sort_order", label: "ক্রম" },
      { key: "is_active", label: "সক্রিয়" },
    ],
    fields: [
      { key: "title", label: "নাম", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "description", label: "বিবরণ", type: "textarea" },
      { key: "content", label: "কন্টেন্ট", type: "richtext" },
      { key: "icon", label: "Icon", type: "text" },
      { key: "sort_order", label: "ক্রম", type: "number" },
      { key: "is_active", label: "সক্রিয়", type: "boolean" },
    ],
  },
  doctors: {
    table: "doctors",
    title: "ডাক্তার",
    singular: "ডাক্তার",
    searchColumn: "name",
    listColumns: [
      { key: "name", label: "নাম" },
      { key: "speciality", label: "বিশেষজ্ঞতা" },
      { key: "district", label: "জেলা" },
      { key: "is_active", label: "সক্রিয়" },
    ],
    fields: [
      { key: "name", label: "নাম", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "designation", label: "পদবী", type: "text" },
      { key: "speciality", label: "বিশেষজ্ঞতা", type: "text" },
      { key: "hospital", label: "হাসপাতাল", type: "text" },
      { key: "chamber", label: "চেম্বার", type: "text" },
      { key: "district", label: "জেলা", type: "text" },
      { key: "visiting_time", label: "ভিজিটের সময়", type: "text" },
      { key: "fee", label: "ফি", type: "text" },
      { key: "phone", label: "ফোন", type: "text" },
      { key: "photo", label: "ছবি URL", type: "text" },
      { key: "bio", label: "পরিচিতি", type: "textarea" },
      { key: "is_active", label: "সক্রিয়", type: "boolean" },
    ],
  },
  hospitals: {
    table: "hospitals",
    title: "হাসপাতাল",
    singular: "হাসপাতাল",
    searchColumn: "name",
    listColumns: [
      { key: "name", label: "নাম" },
      { key: "district", label: "জেলা" },
      { key: "phone", label: "ফোন" },
      { key: "is_active", label: "সক্রিয়" },
    ],
    fields: [
      { key: "name", label: "নাম", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "district", label: "জেলা", type: "text" },
      { key: "address", label: "ঠিকানা", type: "textarea" },
      { key: "phone", label: "ফোন", type: "text" },
      { key: "emergency_number", label: "জরুরি নম্বর", type: "text" },
      { key: "google_map", label: "Google Map URL", type: "text" },
      { key: "image", label: "ছবি URL", type: "text" },
      { key: "description", label: "বিবরণ", type: "textarea" },
      { key: "is_active", label: "সক্রিয়", type: "boolean" },
    ],
  },
  labs: {
    table: "labs",
    title: "ল্যাব",
    singular: "ল্যাব",
    searchColumn: "name",
    listColumns: [
      { key: "name", label: "নাম" },
      { key: "test_type", label: "টেস্ট" },
      { key: "district", label: "জেলা" },
      { key: "price", label: "মূল্য" },
    ],
    fields: [
      { key: "name", label: "নাম", type: "text", required: true },
      { key: "test_type", label: "টেস্ট ধরন", type: "text" },
      { key: "price", label: "মূল্য", type: "number" },
      { key: "district", label: "জেলা", type: "text" },
      { key: "address", label: "ঠিকানা", type: "textarea" },
      { key: "phone", label: "ফোন", type: "text" },
      { key: "is_active", label: "সক্রিয়", type: "boolean" },
    ],
  },
  videos: {
    table: "videos",
    title: "ভিডিও",
    singular: "ভিডিও",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "title",
    listColumns: [
      { key: "title", label: "শিরোনাম" },
      { key: "category", label: "ক্যাটাগরি" },
      { key: "is_published", label: "প্রকাশিত" },
    ],
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true },
      { key: "youtube_id", label: "YouTube ID", type: "text", required: true },
      { key: "thumbnail", label: "থাম্বনেইল URL", type: "text" },
      { key: "category", label: "ক্যাটাগরি", type: "text" },
      { key: "description", label: "বিবরণ", type: "textarea" },
      { key: "is_published", label: "প্রকাশিত", type: "boolean" },
    ],
  },
  podcasts: {
    table: "podcasts",
    title: "পডকাস্ট",
    singular: "পডকাস্ট",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "title",
    listColumns: [
      { key: "title", label: "শিরোনাম" },
      { key: "is_published", label: "প্রকাশিত" },
    ],
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true },
      { key: "description", label: "বিবরণ", type: "textarea" },
      { key: "youtube_link", label: "YouTube লিংক", type: "text" },
      { key: "spotify_link", label: "Spotify লিংক", type: "text" },
      { key: "thumbnail", label: "থাম্বনেইল URL", type: "text" },
      { key: "is_published", label: "প্রকাশিত", type: "boolean" },
    ],
  },
  mythbusters: {
    table: "mythbusters",
    title: "মিথবাস্টার",
    singular: "মিথ",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "title",
    listColumns: [
      { key: "title", label: "শিরোনাম" },
      { key: "doctor_name", label: "ডাক্তার" },
      { key: "is_published", label: "প্রকাশিত" },
    ],
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true },
      { key: "claim", label: "দাবি (মিথ)", type: "textarea", required: true },
      { key: "fact", label: "প্রকৃত তথ্য", type: "textarea", required: true },
      { key: "doctor_name", label: "ডাক্তারের নাম", type: "text" },
      { key: "video", label: "ভিডিও URL", type: "text" },
      { key: "is_published", label: "প্রকাশিত", type: "boolean" },
    ],
  },
  questions: {
    table: "questions",
    title: "প্রশ্ন-উত্তর",
    singular: "প্রশ্ন",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "name",
    listColumns: [
      { key: "name", label: "নাম" },
      { key: "email", label: "ইমেইল" },
      { key: "is_published", label: "প্রকাশিত" },
    ],
    fields: [
      { key: "name", label: "নাম", type: "text", required: true },
      { key: "email", label: "ইমেইল", type: "text", required: true },
      { key: "question", label: "প্রশ্ন", type: "textarea", required: true },
      { key: "answer", label: "উত্তর", type: "richtext" },
      { key: "answered_by", label: "উত্তরদাতা", type: "text" },
      { key: "is_published", label: "প্রকাশিত", type: "boolean" },
    ],
  },
  "blood-donors": {
    table: "blood_donors",
    title: "রক্তদাতা",
    singular: "রক্তদাতা",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "name",
    listColumns: [
      { key: "name", label: "নাম" },
      { key: "blood_group", label: "গ্রুপ" },
      { key: "district", label: "জেলা" },
      { key: "is_available", label: "প্রাপ্য" },
    ],
    fields: [
      { key: "name", label: "নাম", type: "text", required: true },
      {
        key: "blood_group",
        label: "রক্তের গ্রুপ",
        type: "select",
        required: true,
        options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({ value: v, label: v })),
      },
      { key: "district", label: "জেলা", type: "text", required: true },
      { key: "phone", label: "ফোন", type: "text", required: true },
      { key: "last_donation_date", label: "শেষ দান", type: "date" },
      { key: "is_available", label: "প্রাপ্য", type: "boolean" },
    ],
  },
  advertisements: {
    table: "advertisements",
    title: "বিজ্ঞাপন",
    singular: "বিজ্ঞাপন",
    orderBy: { column: "created_at", ascending: false },
    searchColumn: "title",
    listColumns: [
      { key: "title", label: "শিরোনাম" },
      { key: "placement", label: "স্থান" },
      { key: "is_active", label: "সক্রিয়" },
    ],
    fields: [
      { key: "title", label: "শিরোনাম", type: "text", required: true },
      {
        key: "placement",
        label: "স্থান",
        type: "select",
        required: true,
        options: [
          { value: "header", label: "Header" },
          { value: "sidebar", label: "Sidebar" },
          { value: "in_article", label: "In Article" },
          { value: "footer", label: "Footer" },
          { value: "popup", label: "Popup" },
        ],
      },
      { key: "image_url", label: "ছবি URL", type: "text" },
      { key: "link_url", label: "লিংক URL", type: "text" },
      { key: "html_code", label: "HTML কোড", type: "textarea" },
      { key: "start_date", label: "শুরুর তারিখ", type: "date" },
      { key: "end_date", label: "শেষ তারিখ", type: "date" },
      { key: "is_active", label: "সক্রিয়", type: "boolean" },
    ],
  },
  seo: {
    table: "seo",
    title: "SEO",
    singular: "SEO রেকর্ড",
    searchColumn: "route",
    listColumns: [
      { key: "route", label: "রুট" },
      { key: "title", label: "টাইটেল" },
    ],
    fields: [
      { key: "route", label: "রুট (যেমন: /about)", type: "text", required: true },
      { key: "title", label: "টাইটেল", type: "text" },
      { key: "description", label: "ডেসক্রিপশন", type: "textarea" },
      { key: "keywords", label: "কীওয়ার্ড", type: "text" },
      { key: "og_image", label: "OG ছবি URL", type: "text" },
      { key: "schema_jsonld", label: "Schema JSON-LD", type: "json" },
    ],
  },
  settings: {
    table: "settings",
    title: "সাইট সেটিংস",
    singular: "সেটিংস",
    pk: "key",
    searchColumn: "key",
    listColumns: [
      { key: "key", label: "Key" },
    ],
    fields: [
      { key: "key", label: "Key", type: "text", required: true },
      { key: "value", label: "Value (JSON)", type: "json", required: true },
    ],
  },
};