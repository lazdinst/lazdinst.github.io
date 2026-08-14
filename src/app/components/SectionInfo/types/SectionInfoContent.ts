export interface SectionInfoControl {
  name: string;
  detail: string;
}

export interface SectionInfoContent {
  title: string;
  summary: string;
  controls?: SectionInfoControl[];
}
