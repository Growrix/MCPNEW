import { ValidationResult } from '../../mcp-system/contracts/validation-result';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SystemValidator {
  async validateTypes(): Promise<ValidationResult> {
    try {
      await execAsync('npx tsc --noEmit');
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.stdout || error.message]
      };
    }
  }

  async validateLint(): Promise<ValidationResult> {
    // Mock lint for now
    return { valid: true };
  }

  async validateTests(): Promise<ValidationResult> {
    try {
      await execAsync('npx vitest run');
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        errors: [error.stdout || error.message]
      };
    }
  }
}
