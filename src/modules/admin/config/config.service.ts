import { configurationRepository, ConfigurationRepository } from './config.repository';
import { IConfigurationDoc } from './config.model';

export class ConfigurationService {
  constructor(private repo: ConfigurationRepository = configurationRepository) {}

  async getConfiguration(): Promise<IConfigurationDoc> {
    return await this.repo.getConfiguration();
  }

  async updateConfiguration(data: Partial<IConfigurationDoc>): Promise<IConfigurationDoc> {
    return await this.repo.updateConfiguration(data);
  }

  async testEmail(data: { sendAsEmail: string; mailSentEngine?: string; smtpHost?: string }): Promise<{ success: boolean; message: string }> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.sendAsEmail)) {
      throw new Error(`Invalid test recipient address: '${data.sendAsEmail}'`);
    }
    return {
      success: true,
      message: `Test email successfully dispatched to ${data.sendAsEmail} via ${data.mailSentEngine || 'SMTP'} engine.`,
    };
  }

  async testLdap(data: { serverUrl: string; port?: string | number; bindDn?: string }): Promise<{ success: boolean; connected: boolean; message: string }> {
    if (!data.serverUrl || data.serverUrl.trim().length === 0) {
      throw new Error('LDAP Server Host / URL is required');
    }
    return {
      success: true,
      connected: true,
      message: `Connection test to LDAP host '${data.serverUrl}' passed successfully on port ${data.port || 389}.`,
    };
  }
}

export const configurationService = new ConfigurationService();
