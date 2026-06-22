import Template01 from "@/components/templates/template-01";
import Template02 from "@/components/templates/template-02";
import Template03 from "@/components/templates/template-03";
import Template04 from "@/components/templates/template-04";
import Template05 from "@/components/templates/template-05";
import { type TemplateProp } from "@/components/templates/template-wrapper";
import {
  defaultSectionOrder,
  type SectionType,
} from "@/stores/features/template.slice";

export const TemplateKey = {
  template01: "template-01",
  template02: "template-02",
  template03: "template-03",
  template04: "template-04",
  template05: "template-05",
} as const;

export interface TemplateProfile {
  id: string;
  name: string;
  component: React.FC<TemplateProp>;
  defaultSectionOrder: SectionType[];
}

export const TEMPLATES: Record<string, TemplateProfile> = {
  [TemplateKey.template01]: {
    id: TemplateKey.template01,
    name: "Classic",
    component: Template01,
    defaultSectionOrder: defaultSectionOrder,
  },
  [TemplateKey.template02]: {
    id: TemplateKey.template02,
    name: "Modern",
    component: Template02,
    defaultSectionOrder: defaultSectionOrder,
  },
  [TemplateKey.template03]: {
    id: TemplateKey.template03,
    name: "Elegant",
    component: Template03,
    defaultSectionOrder: defaultSectionOrder,
  },
  [TemplateKey.template04]: {
    id: TemplateKey.template04,
    name: "Compact",
    component: Template04,
    defaultSectionOrder: defaultSectionOrder,
  },
  [TemplateKey.template05]: {
    id: TemplateKey.template05,
    name: "Executive",
    component: Template05,
    defaultSectionOrder: defaultSectionOrder,
  },
};
