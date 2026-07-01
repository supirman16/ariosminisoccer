import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { crypto } from "https://deno.land/std@0.167.0/crypto/mod.ts";

Deno.serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { customer, schedules, userId, userPackageId } = await req.json()

    // Buat Supabase client dengan akses admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const totalHoursNeeded = schedules.length

    // 1. Verifikasi paket dan sisa jam
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('user_packages')
      .select('remaining_hours')
      .eq('id', userPackageId)
      .eq('user_id', userId)
      .single()

    if (packageError || !packageData || packageData.remaining_hours < totalHoursNeeded) {
      throw new Error('Paket tidak valid atau sisa jam tidak mencukupi.')
    }

    const newRemainingHours = packageData.remaining_hours - totalHoursNeeded

    // 2. Buat booking baru dengan status 'confirmed' dan harga 0
    const orderId = `ORDER-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const bookingsToInsert = schedules.map((s: any) => ({
      order_id: orderId,
      user_id: userId,
      nama_pemesan: customer.nama_pemesan,
      nomor_telepon: customer.nomor_telepon,
      tanggal_booking: s.date,
      jam_mulai: s.time,
      durasi: parseInt(s.duration),
      status_pembayaran: 'confirmed', // Langsung confirmed karena pakai paket
      total_price: 0,
      discount_applied: 0,
    }))

    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingsToInsert)

    if (bookingError) throw bookingError

    // 3. Update sisa jam di user_packages
    const { error: updateError } = await supabaseAdmin
      .from('user_packages')
      .update({ remaining_hours: newRemainingHours })
      .eq('id', userPackageId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ message: `Booking berhasil menggunakan paket! Sisa jam Anda: ${newRemainingHours}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
