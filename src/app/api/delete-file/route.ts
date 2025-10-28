import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, DestroyOptions } from 'cloudinary'; // 👈 تم إضافة DestroyOptions

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { public_id, resource_type = 'auto' } = await request.json();
    
    if (!public_id) {
      return NextResponse.json(
        { success: false, error: 'معرف الملف مطلوب' },
        { status: 400 }
      );
    }

    // حذف الملف من Cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
      // ✅ تصحيح الخطأ: استخدام النوع الصحيح لـ resource_type
      resource_type: resource_type as DestroyOptions['resource_type'] 
    });

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({
        success: true,
        result: result.result,
        message: result.result === 'ok' ? 'تم حذف الملف بنجاح' : 'الملف غير موجود'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'فشل في حذف الملف' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حذف الملف' },
      { status: 500 }
    );
  }
}

// دالة لحذف عدة ملفات
export async function DELETE(request: NextRequest) {
  try {
    const { public_ids, resource_type = 'auto' } = await request.json();
    
    if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'قائمة معرفات الملفات مطلوبة' },
        { status: 400 }
      );
    }

    // حذف عدة ملفات
    const deletePromises = public_ids.map(public_id =>
      cloudinary.uploader.destroy(public_id, { 
        // ✅ تصحيح الخطأ: استخدام النوع الصحيح لـ resource_type
        resource_type: resource_type as DestroyOptions['resource_type'] 
      })
    );

    const results = await Promise.allSettled(deletePromises);
    
    const successCount = results.filter(result => 
      result.status === 'fulfilled' && 
      (result.value.result === 'ok' || result.value.result === 'not found')
    ).length;

    return NextResponse.json({
      success: true,
      deleted_count: successCount,
      total_count: public_ids.length,
      message: `تم حذف ${successCount} من ${public_ids.length} ملف`
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حذف الملفات' },
      { status: 500 }
    );
  }
}
