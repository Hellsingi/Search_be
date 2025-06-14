import loki from 'lokijs';
import { Company, CompanySchema } from '../models/company.model';

export class CompanyDB {
  private db: loki;
  private companies: Collection<Company>;

  constructor() {
    this.db = new loki('companies.db');
    this.companies = this.db.addCollection<Company>('companies');

    [
      { id: '1', name: 'ACCELERATE SHIPPING' },
      { id: '2', name: 'BARTER SHIPPING' },
      { id: '3', name: 'BLINK SHIPPING' },
      { id: '4', name: 'COMMAND SHIPPING' },
      { id: '5', name: 'CORE SHIPPING' },
      { id: '6', name: 'EXPERT SHIPPING' },
      { id: '7', name: 'EXPRESS SHIPPING' },
      { id: '8', name: 'FINEST SHIPPING' },
      { id: '9', name: 'KART SHIPPING' },
      { id: '10', name: 'LIFT SHIPPING' },
      { id: '11', name: 'LIMITLESS SHIPPING' },
      { id: '12', name: 'MEASURED SHIPPING' },
      { id: '13', name: 'OPTIMUM SHIPPING' },
      { id: '14', name: 'PROGRESS SHIPPING' },
      { id: '15', name: 'PROPEL SHIPPING' },
      { id: '16', name: 'RELY SHIPPING' },
      { id: '17', name: 'RUSH SHIPPING' },
      { id: '18', name: 'SECURE SHIPPING' },
      { id: '19', name: 'SHEER SHIPPING' },
      { id: '20', name: 'SHIPPINGADORA' },
      { id: '21', name: 'SHIPPINGADRI' },
      { id: '22', name: 'SHIPPINGLUX' },
      { id: '23', name: 'SUPREME SHIPPING' },
      { id: '24', name: 'TRUE SHIPPING' },
      { id: '25', name: 'TOTAL SHIPPING' },
      { id: '26', name: 'TRIUMPH SHIPPING' },
      { id: '27', name: 'TURBO SHIPPING' },
      { id: '28', name: 'UNLEASH SHIPPING' },
      { id: '29', name: 'VANGUARD SHIPPING' },
    ].forEach((company) => {
      this.companies.insert(CompanySchema.parse(company));
    });
  }

  getCompanyById(id: string): Company {
    const company = this.companies.findOne({ id });
    if (!company) {
      throw new Error(`Company with ID ${id} not found`);
    }
    return company;
  }

  getCompaniesByIds(ids: string[]): Map<string, Company> {
    const companies = this.companies.find({ id: { $in: ids } });
    const companyMap = new Map<string, Company>();

    companies.forEach(company => {
      companyMap.set(company.id, company);
    });

    const missingIds = ids.filter(id => !companyMap.has(id));
    if (missingIds.length > 0) {
      throw new Error(`Companies with IDs ${missingIds.join(', ')} not found`);
    }

    return companyMap;
  }
}
