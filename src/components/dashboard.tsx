import { Header } from '@/components/header';
import { HabitList } from '@/components/habit-list';
import { GroupRanking } from '@/components/group-ranking';
import { PersonalizedMotivation } from '@/components/personalized-motivation';

export function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HabitList />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <GroupRanking />
          <PersonalizedMotivation />
        </div>
      </main>
    </div>
  );
}
