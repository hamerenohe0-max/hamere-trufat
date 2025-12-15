import { memo } from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { DashboardSummary, NewsItem, ProgressReport } from '../../../types/models';
import { Link } from 'expo-router';

interface SectionProps {
  summary: DashboardSummary;
  onRefresh: () => void;
}

export const DashboardSections = memo(({ summary }: SectionProps) => {
  return (
    <View style={{ gap: 16 }}>
      <Card title="Daily Gospel">
        <Text style={styles.bold}>{summary.dailyGospel.title}</Text>
        <Text style={styles.muted}>{summary.dailyGospel.reference}</Text>
        <Text style={styles.paragraph}>{summary.dailyGospel.body}</Text>
      </Card>

      <Card title="Latest News" actionHref="/(protected)/news">
        <FlatList
          data={summary.latestNews}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => <NewsRow item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Card>

      <Card title="Progress Reports" actionHref="/(protected)/progress">
        {summary.progressReports.map((report) => (
          <ProgressRow key={report.id} report={report} />
        ))}
      </Card>

      {summary.featuredArticle && (
        <Card title="Featured Article" actionHref="/(protected)/articles">
          <Text style={styles.bold}>{summary.featuredArticle.title}</Text>
          <Text style={styles.paragraph}>{summary.featuredArticle.excerpt}</Text>
        </Card>
      )}

      {summary.todaysSaint && (
        <Card title="Today’s Saint">
          <Text style={styles.bold}>{summary.todaysSaint.name}</Text>
          <Text style={styles.paragraph}>{summary.todaysSaint.biography}</Text>
        </Card>
      )}

      {summary.upcomingEvent && (
        <Card title="Upcoming Event" actionHref="/(protected)/events">
          <Text style={styles.bold}>{summary.upcomingEvent.name}</Text>
          <Text style={styles.muted}>{summary.upcomingEvent.startDate}</Text>
          <Text style={styles.paragraph}>{summary.upcomingEvent.description}</Text>
        </Card>
      )}

      <Card title="Quick Links">
        <View style={styles.quickLinks}>
          {summary.quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={styles.quickLink}
            >
              {link.label}
            </Link>
          ))}
        </View>
      </Card>
    </View>
  );
});

function Card({
  title,
  children,
  actionHref,
}: {
  title: string;
  children: React.ReactNode;
  actionHref?: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {actionHref && (
          <Link href={actionHref} style={styles.link}>
            See all
          </Link>
        )}
      </View>
      {children}
    </View>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <Link href={`/(protected)/news/${item.id}`} asChild>
      <TouchableOpacity style={styles.row}>
        <View>
          <Text style={styles.bold}>{item.title}</Text>
          <Text style={styles.muted}>{item.publishedAt}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function ProgressRow({ report }: { report: ProgressReport }) {
  return (
    <Link href={`/(protected)/progress/${report.id}`} asChild>
      <TouchableOpacity style={styles.row}>
        <View>
          <Text style={styles.bold}>{report.title}</Text>
          <Text style={styles.muted}>{report.summary}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#0f172a',
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  link: {
    color: '#2563eb',
    fontWeight: '600' as const,
  },
  bold: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0f172a',
  },
  muted: {
    color: '#64748b',
    fontSize: 12,
  },
  paragraph: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  quickLinks: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  quickLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    fontWeight: '600' as const,
  },
};


