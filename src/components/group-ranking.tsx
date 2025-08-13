import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ArrowUp, ArrowDown } from 'lucide-react';

const groupMembers = [
  { name: 'You', score: 1250, rank: 1, avatar: 'https://placehold.co/40x40.png', change: 'up' },
  { name: 'Alex', score: 1100, rank: 2, avatar: 'https://placehold.co/40x40.png', change: 'down' },
  { name: 'Jess', score: 980, rank: 3, avatar: 'https://placehold.co/40x40.png', change: 'up' },
  { name: 'Mo', score: 950, rank: 4, avatar: 'https://placehold.co/40x40.png', change: 'down' },
];

export function GroupRanking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Group: "Procrasti-haters"</CardTitle>
        <CardDescription>Your weekly progress ranking.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {groupMembers.map((member, index) => (
            <li key={member.name} className="flex items-center gap-4">
              <span className="text-lg font-bold text-muted-foreground">{member.rank}</span>
              <Avatar>
                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="user avatar" />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.score} points</p>
              </div>
              <div className="flex items-center gap-1">
                {index === 0 && <Trophy className="h-5 w-5 text-warning" />}
                {member.change === 'up' && <ArrowUp className="h-4 w-4 text-success" />}
                {member.change === 'down' && <ArrowDown className="h-4 w-4 text-destructive" />}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
