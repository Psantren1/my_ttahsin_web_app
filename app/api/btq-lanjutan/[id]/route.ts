import { NextRequest, NextResponse } from 'next/server';
import { deleteBtqLanjutan } from '@/lib/services/btq-lanjutan.service';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteBtqLanjutan(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data BTQ Lanjutan' }, { status: 500 });
  }
}
