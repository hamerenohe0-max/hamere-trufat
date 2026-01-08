import { IsString, IsOptional, IsDateString, IsUrl, IsEnum } from 'class-validator';

export class CreateDailyReadingDto {
    @IsDateString()
    date: string;

    @IsEnum(['Morning', 'Evening'])
    timeOfDay: 'Morning' | 'Evening';

    // Gospel
    @IsString()
    @IsOptional()
    gospelGeez?: string;

    @IsString()
    @IsOptional()
    gospelAmharic?: string;

    @IsUrl()
    @IsOptional()
    gospelAudioUrl?: string;

    @IsString()
    @IsOptional()
    gospelRef?: string;

    // Epistle (No Audio)
    @IsString()
    @IsOptional()
    epistleGeez?: string;

    @IsString()
    @IsOptional()
    epistleAmharic?: string;

    @IsString()
    @IsOptional()
    epistleRef?: string;

    // Psalms
    @IsString()
    @IsOptional()
    psalmGeez?: string;

    @IsString()
    @IsOptional()
    psalmAmharic?: string;

    @IsUrl()
    @IsOptional()
    psalmAudioUrl?: string;

    @IsString()
    @IsOptional()
    psalmRef?: string;

    // Acts (New)
    @IsString()
    @IsOptional()
    actsGeez?: string;

    @IsString()
    @IsOptional()
    actsAmharic?: string;

    @IsString()
    @IsOptional()
    actsRef?: string;
}
