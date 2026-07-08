import { NextRequest, NextResponse } from 'next/server';
import { getKelasById, updateKelas, deleteKelas } from '@/lib/services/kelas.service';
import { getSession, requireRole } from '@/lib/auth/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireRole(['ADMIN', 'MUSYRIF', 'SANTRI']);
    if (error) return error;
    if (!session) return NextResponse.json({ error: 'Session tidak valid' }, { status: 401 });

    const data = await getKelasById(params.id);
    if (!data) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya admin yang dapat mengubah kelas' }, { status: 403 });
    }

    const body = await request.json();
    const musyrif_ids: string[] | undefined = body.musyrif_ids ?? (body.musyrif_id ? [body.musyrif_id] : undefined);

    const data = await updateKelas(params.id, {
      nama: body.nama,
      level: body.level,
      deskripsi: body.deskripsi,
      musyrif_ids,
    });

    if (!data) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate kelas' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya admin yang dapat menghapus kelas' }, { status: 403 });
    }

    const deleted = await deleteKelas(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus kelas' }, { status: 500 });
  }
}
