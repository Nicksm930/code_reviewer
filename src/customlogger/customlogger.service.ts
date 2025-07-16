import { ConsoleLogger, Injectable } from '@nestjs/common';
import chalk from 'chalk';
@Injectable()
export class CustomloggerService extends ConsoleLogger {
    log(message: string) {
        super.log(chalk.green(`[LOG] ${message}`));
    }

    error(message: string, trace?: string) {
        super.error(chalk.red(`[ERROR] ${message}`), trace);
    }

    warn(message: string) {
        super.warn(chalk.yellow(`[WARN] ${message}`));
    }

    debug(message: string) {
        super.debug(chalk.blue(`[DEBUG] ${message}`));
    }

    verbose(message: string) {
        super.verbose(chalk.cyan(`[VERBOSE] ${message}`));
    }
}
