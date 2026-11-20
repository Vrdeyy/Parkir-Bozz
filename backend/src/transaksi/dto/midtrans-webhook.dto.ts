import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MidtransWebhookDto {
    @ApiProperty({ example: 'PKR-17316749-A1B2C3D4-1731675000', description: 'Order ID transaksi' })
    @IsString()
    order_id!: string;

    @ApiProperty({ example: '200', description: 'Status code dari Midtrans' })
    @IsString()
    status_code!: string;

    @ApiProperty({ example: '10000.00', description: 'Nominal pembayaran' })
    @IsString()
    gross_amount!: string;

    @ApiProperty({ example: 'settlement', description: 'Status transaksi (settlement, pending, expire, cancel)' })
    @IsString()
    transaction_status!: string;

    @ApiPropertyOptional({ example: 'qris', description: 'Metode pembayaran (qris)' })
    @IsOptional()
    @IsString()
    payment_type?: string;

    @ApiProperty({ example: 'a1b2c3d4...', description: 'Signature key SHA-512 dari Midtrans' })
    @IsString()
    signature_key!: string;

    @ApiPropertyOptional({ example: '2026-11-15 19:30:00', description: 'Waktu transaksi settlement' })
    @IsOptional()
    @IsString()
    settlement_time?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    transaction_type?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    transaction_time?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    transaction_id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    status_message?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    merchant_id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fraud_status?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    expiry_time?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional()
    @IsOptional()
    customer_details?: any;

    [key: string]: any;
}
