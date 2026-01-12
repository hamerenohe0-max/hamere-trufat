import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { Database } from '../../../common/supabase/types';

type GameScoreInsert = Database['public']['Tables']['game_scores']['Insert'];

@Injectable()
export class GamesService {
  constructor(private readonly supabase: SupabaseService) { }

  async saveScore(userId: string, game: 'trivia' | 'puzzle' | 'saint' | 'memory' | 'who-said-it' | 'charades' | 'scramble' | 'parable' | 'bingo' | 'journey' | 'virtue' | 'history' | 'matchup', score: number, metadata?: Record<string, unknown>): Promise<any> {
    const { data, error } = await this.supabase.client
      .from('game_scores')
      .insert({
        user_id: userId,
        game,
        score,
        metadata: metadata || {},
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getUserScores(userId: string, game?: string, limit = 20) {
    let query = this.supabase.client
      .from('game_scores')
      .select('*')
      .eq('user_id', userId);

    if (game) query = query.eq('game', game);

    const { data } = await query
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async getLeaderboard(game: string, limit = 10) {
    const { data } = await this.supabase.client
      .from('game_scores')
      .select('*, users(name, email)')
      .eq('game', game)
      .order('score', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async getUserHighScore(userId: string, game: string): Promise<any | null> {
    const { data } = await this.supabase.client
      .from('game_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('game', game)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    return data;
  }
}

