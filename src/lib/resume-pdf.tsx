import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { resume } from "@/content/resume";
import { about } from "@/content/about";
import { skills } from "@/content/skills";
import { projects } from "@/content/projects";
import { certifications } from "@/content/certifications";

// A one-page resume built entirely from the same content/ modules the site
// itself reads from — no separate "resume data" fork to keep in sync. See
// docs/08-roadmap.md Phase 4 "Resume export (clean PDF)."
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#222222", fontFamily: "Helvetica" },
  name: { fontSize: 22, marginBottom: 2 },
  role: { fontSize: 12, color: "#4a4a4a", marginBottom: 8 },
  contact: { fontSize: 9, color: "#555555", marginBottom: 16 },
  summary: { marginBottom: 16, lineHeight: 1.4 },
  sectionTitle: {
    fontSize: 11,
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0f766e",
  },
  item: { marginBottom: 8 },
  itemTitleRow: { flexDirection: "row", justifyContent: "space-between" },
  itemTitle: { fontSize: 10.5 },
  itemMeta: { fontSize: 9, color: "#666666" },
  itemBody: { fontSize: 9.5, color: "#333333", marginTop: 2, lineHeight: 1.35 },
  skillRow: { flexDirection: "row", flexWrap: "wrap" },
  skillPill: {
    fontSize: 9,
    backgroundColor: "#f1f1ef",
    color: "#333333",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 3,
    marginRight: 6,
    marginBottom: 6,
  },
});

export function ResumeDocument() {
  return (
    <Document title={`${resume.name} — Résumé`} author={resume.name}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.name}</Text>
        <Text style={styles.role}>{resume.role}</Text>
        <Text style={styles.contact}>
          {resume.email} · {resume.location}
        </Text>
        <Text style={styles.summary}>{resume.summary}</Text>

        <Text style={styles.sectionTitle}>Selected Work</Text>
        {projects.map((project) => (
          <View key={project.slug} style={styles.item}>
            <View style={styles.itemTitleRow}>
              <Text style={styles.itemTitle}>{project.title}</Text>
              <Text style={styles.itemMeta}>{project.role}</Text>
            </View>
            <Text style={styles.itemBody}>{project.summary}</Text>
            <Text style={styles.itemMeta}>{project.stack.join(" · ")}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillRow}>
          {skills.map((skill) => (
            <Text key={skill.id} style={styles.skillPill}>
              {skill.name}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Certifications</Text>
        {certifications.map((cert) => (
          <View key={cert.id} style={styles.item}>
            <View style={styles.itemTitleRow}>
              <Text style={styles.itemTitle}>{cert.title}</Text>
              <Text style={styles.itemMeta}>{new Date(cert.date).getFullYear()}</Text>
            </View>
            <Text style={styles.itemMeta}>{cert.issuer}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>What drives the work</Text>
        <Text style={styles.itemBody}>{about.themes.join(" · ")}</Text>
      </Page>
    </Document>
  );
}
