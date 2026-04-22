import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface SemrushOverview {
  Dn?: string;
  Rk?: string;
  Or?: string;
  Ot?: string;
  Oc?: string;
  Ad?: string;
  At?: string;
  Ac?: string;
  isMock?: boolean;
}

export interface SemrushKeyword {
  Ph?: string;
  Po?: string;
  Nq?: string;
  Cp?: string;
  Tr?: string;
}

export interface SemrushBacklinks {
  ascore?: string;
  total?: string;
  domains_num?: string;
  urls_num?: string;
  ips_num?: string;
}

export interface SemrushCompetitor {
  Dn?: string;
  Cr?: string; // Common keywords
  Or?: string; // Keywords
  Ot?: string; // Traffic
  Oc?: string; // Cost
}

@Injectable()
export class SemrushService {
  private readonly logger = new Logger(SemrushService.name);
  private readonly apiUrl = 'https://api.semrush.com/';

  constructor(private configService: ConfigService) { }

  private get apiKey() {
    return this.configService.get<string>('SEMRUSH_API_KEY');
  }

  private get database() {
    return this.configService.get<string>('SEMRUSH_DATABASE') || 'us';
  }

  async getDomainOverview(domain: string): Promise<SemrushOverview | null> {
    if (!this.apiKey || this.apiKey === 'your_semrush_api_key_here') {
      return this.getMockOverview(domain);
    }

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          key: this.apiKey,
          type: 'domain_ranks',
          domain: domain,
          database: this.database,
          export_columns: 'Dn,Rk,Or,Ot,Oc,Ad,At,Ac',
        },
      });

      return this.parseCsv(response.data) as SemrushOverview;
    } catch (error) {
      this.logger.error(`Semrush Overview error: ${error.message}`);
      return this.getMockOverview(domain);
    }
  }

  async getBacklinksOverview(domain: string): Promise<SemrushBacklinks | null> {
    if (!this.apiKey || this.apiKey === 'your_semrush_api_key_here') {
      return this.getMockBacklinks();
    }

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          key: this.apiKey,
          type: 'backlinks_overview',
          target: domain,
          target_type: 'root_domain',
          export_columns: 'ascore,total,domains_num,urls_num,ips_num',
        },
      });

      return this.parseCsv(response.data) as SemrushBacklinks;
    } catch (error) {
      this.logger.error(`Semrush Backlinks error: ${error.message}`);
      return this.getMockBacklinks();
    }
  }

  async getOrganicCompetitors(domain: string, limit = 5): Promise<SemrushCompetitor[]> {
    if (!this.apiKey || this.apiKey === 'your_semrush_api_key_here') {
      return this.getMockCompetitors();
    }

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          key: this.apiKey,
          type: 'domain_organic_organic',
          domain: domain,
          database: this.database,
          display_limit: limit,
          export_columns: 'Dn,Cr,Or,Ot,Oc',
        },
      });

      return this.parseCsvList(response.data) as SemrushCompetitor[];
    } catch (error) {
      this.logger.error(`Semrush Competitors error: ${error.message}`);
      return this.getMockCompetitors();
    }
  }

  async getOrganicKeywords(domain: string, limit = 10): Promise<SemrushKeyword[]> {
    if (!this.apiKey || this.apiKey === 'your_semrush_api_key_here') {
      return this.getMockKeywords();
    }

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          key: this.apiKey,
          type: 'domain_organic',
          domain: domain,
          database: this.database,
          display_limit: limit,
          export_columns: 'Ph,Po,Nq,Cp,Tr',
        },
      });

      return this.parseCsvList(response.data) as SemrushKeyword[];
    } catch (error) {
      this.logger.error(`Semrush Keywords error: ${error.message}`);
      return this.getMockKeywords();
    }
  }

  private parseCsv(csvData: string): any | null {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].split(';').map(h => h.trim());
    const values = lines[1].split(';').map(v => v.trim());

    const result: any = {};
    const columnMap: Record<string, string> = {
      'Domain': 'Dn',
      'Rank': 'Rk',
      'Organic Keywords': 'Or',
      'Organic Traffic': 'Ot',
      'Organic Cost': 'Oc',
      'Adwords Keywords': 'Ad',
      'Adwords Traffic': 'At',
      'Adwords Cost': 'Ac',
      'Authority Score': 'ascore',
      'Total Backlinks': 'total',
      'Referring Domains': 'domains_num',
      'Referring URLs': 'urls_num',
      'Referring IPs': 'ips_num'
    };

    headers.forEach((header, index) => {
      const key = columnMap[header] || header;
      result[key] = values[index];
    });

    return result;
  }

  private parseCsvList(csvData: string): any[] {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map(h => h.trim());
    const dataRows = lines.slice(1);

    const columnMap: Record<string, string> = {
      'Keyword': 'Ph',
      'Position': 'Po',
      'Search Volume': 'Nq',
      'CPC': 'Cp',
      'Traffic %': 'Tr',
      'Domain': 'Dn',
      'Common Keywords': 'Cr',
      'Keywords': 'Or',
      'Search Traffic': 'Ot',
      'Search Cost': 'Oc'
    };

    return dataRows.map(row => {
      const values = row.split(';').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        const key = columnMap[header] || header;
        obj[key] = values[index];
      });
      return obj;
    });
  }

  private getMockOverview(domain: string): SemrushOverview {
    return {
      Dn: domain, Rk: '124', Or: '4500', Ot: '125000', Oc: '15000',
      Ad: '450', At: '12000', Ac: '8500', isMock: true
    };
  }

  private getMockBacklinks(): SemrushBacklinks {
    return { ascore: '45', total: '1250000', domains_num: '8500', urls_num: '450000', ips_num: '4200' };
  }

  private getMockCompetitors(): SemrushCompetitor[] {
    return [
      { Dn: 'competitor1.com', Cr: '1200', Or: '8500', Ot: '45000', Oc: '12000' },
      { Dn: 'competitor2.com', Cr: '950', Or: '6200', Ot: '32000', Oc: '8000' },
      { Dn: 'competitor3.com', Cr: '800', Or: '5400', Ot: '28000', Oc: '7500' },
    ];
  }

  private getMockKeywords(): SemrushKeyword[] {
    return [
      { Ph: 'marketing automation', Po: '1', Nq: '12000', Tr: '15.5' },
      { Ph: 'seo tools', Po: '3', Nq: '45000', Tr: '12.2' },
      { Ph: 'ad agency', Po: '5', Nq: '8000', Tr: '8.4' },
    ];
  }
}
