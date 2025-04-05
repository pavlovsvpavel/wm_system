from io import BytesIO
import qrcode
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader


def generate_pdf(queryset, filename=None):
    """
    Generates PDF with QR codes for the given queryset
    Returns HttpResponse with PDF content
    """

    # Generate filename from queryset
    if filename is None:
        first_item = queryset.first()
        if first_item and hasattr(first_item, 'file') and first_item.file:
            base_filename = first_item.file.name.split('.xlsx')[0]
            filename = f"qr_codes_export_{base_filename}.pdf"
        else:
            filename = "qr_codes_export.pdf"

    # Create PDF buffer
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Set PDF title
    pdf.setTitle("QR Codes Export")

    # PDF layout settings
    qr_size = 160
    horizontal_margin = 15  # Space between QR codes horizontally
    vertical_margin = 5  # Space between rows vertically
    max_per_row = 3
    x, y = 50, height - 50
    current_row = 0
    text_margin_bottom = 8

    for item in queryset:
        # Generate QR code with plain text visible
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(item.pos_serial_number)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        # Save QR code to buffer
        img_buffer = BytesIO()
        img.save(img_buffer)
        img_buffer.seek(0)

        # Draw QR code in PDF
        pdf.drawImage(ImageReader(img_buffer), x, y - qr_size,
                      width=qr_size, height=qr_size, preserveAspectRatio=True)

        serial_text = f"{item.pos_serial_number}"
        font_size = 10 if len(serial_text) < 20 else 8
        pdf.setFont("Helvetica", font_size)

        # Calculate text width and center position
        text_width = pdf.stringWidth(serial_text, "Helvetica", font_size)
        text_x = x + (qr_size - text_width) / 2

        # Draw centered text
        pdf.drawString(text_x, y - qr_size + text_margin_bottom, serial_text)

        # Move to next position
        x += qr_size + horizontal_margin
        current_row += 1

        # New row or page if needed
        if current_row >= max_per_row:
            x = 50
            y -= qr_size + vertical_margin + 10
            current_row = 0

            if y < 100:
                pdf.showPage()
                y = height - 50
                x = 50

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
