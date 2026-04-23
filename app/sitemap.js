const AREA_IDS = [
  'connaught-place','karol-bagh','lajpat-nagar','hauz-khas','greater-kailash',
  'south-ext','defence-colony','nehru-place','malviya-nagar','saket',
  'vasant-vihar','vasant-kunj','munirka','r-k-puram','moti-bagh',
  'janakpuri','rajouri-garden','dwarka','dwarka-mor','uttam-nagar',
  'tilak-nagar','patel-nagar','hari-nagar','rohini','pitampura',
  'shalimar-bagh','model-town','gtb-nagar','mukherjee-nagar','laxmi-nagar',
  'preet-vihar','mayur-vihar','kondli','shahdara',
  'golf-course-road','golf-course-ext','dwarka-expressway','sohna-road',
  'mg-road','sector-14','sector-15','sector-22','sector-40','sector-45',
  'sector-56','sector-57','sector-67','new-gurgaon','sushant-lok',
  'palam-vihar','manesar','south-city','dlf-city',
  'sector-18','sector-15-noida','sector-44','sector-50','sector-61',
  'sector-62','sector-75','sector-78','sector-100','sector-120',
  'sector-128','sector-137','sector-150','noida-expressway',
  'greater-noida-west','greater-noida','yamuna-expressway',
  'sector-15-fbd','sector-21-fbd','sector-89-fbd','nit-faridabad',
  'old-faridabad','ballabhgarh',
  'indirapuram','raj-nagar-ext','vasundhara','vaishali',
  'crossings-republik','kaushambi','siddharth-vihar','abhay-khand',
];

export default function sitemap() {
  const base = 'https://delhincr-rents.com';
  const now  = new Date().toISOString();

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    ...AREA_IDS.map(id => ({
      url:             `${base}/area/${id}`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    })),
  ];
}
