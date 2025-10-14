export interface GameData {
  id: string;
  gameType: string;
  score: number;
  duration: number;
  clicks: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalAttempts: number;
  timestamp: string;
}

export interface MiniReport {
  id: string;
  gameId: string;
  gameType: string;
  analysis: string;
  score: number;
  timestamp: string;
}

export interface FinalReport {
  id: string;
  analysis: string;
  miniReportsIds: string[];
  timestamp: string;
}

class StorageService {
  private GAME_DATA_KEY = 'wesal_game_data';
  private MINI_REPORTS_KEY = 'wesal_mini_reports';
  private FINAL_REPORTS_KEY = 'wesal_final_reports';

  saveGameData(gameData: GameData): void {
    const allData = this.getAllGameData();
    allData.push(gameData);
    localStorage.setItem(this.GAME_DATA_KEY, JSON.stringify(allData));
  }

  getAllGameData(): GameData[] {
    const data = localStorage.getItem(this.GAME_DATA_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveMiniReport(report: MiniReport): void {
    const allReports = this.getAllMiniReports();
    allReports.push(report);
    localStorage.setItem(this.MINI_REPORTS_KEY, JSON.stringify(allReports));
  }

  getAllMiniReports(): MiniReport[] {
    const data = localStorage.getItem(this.MINI_REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getRecentMiniReports(count: number): MiniReport[] {
    const allReports = this.getAllMiniReports();
    return allReports.slice(-count);
  }

  saveFinalReport(report: FinalReport): void {
    const allReports = this.getAllFinalReports();
    allReports.push(report);
    localStorage.setItem(this.FINAL_REPORTS_KEY, JSON.stringify(allReports));
  }

  getAllFinalReports(): FinalReport[] {
    const data = localStorage.getItem(this.FINAL_REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  clearAllData(): void {
    localStorage.removeItem(this.GAME_DATA_KEY);
    localStorage.removeItem(this.MINI_REPORTS_KEY);
    localStorage.removeItem(this.FINAL_REPORTS_KEY);
  }
}

export const storageService = new StorageService();
