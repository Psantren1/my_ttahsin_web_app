import { NextRequest, NextResponse } from 'next/server';
import { deleteBtqPemula } from '@/lib/services/btq-pemula.service';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteBtqPemula(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data BTQ Pemula' }, { status: 500 });
  }
}
