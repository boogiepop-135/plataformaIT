"""
Export utilities for generating PDF and Excel reports
"""
import io
from datetime import datetime
from flask import make_response
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT


class ExportManager:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.custom_styles = {
            'CustomTitle': ParagraphStyle(
                'CustomTitle',
                parent=self.styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.HexColor('#1e40af')
            ),
            'CustomHeading': ParagraphStyle(
                'CustomHeading',
                parent=self.styles['Heading2'],
                fontSize=14,
                spaceAfter=12,
                alignment=TA_LEFT,
                textColor=colors.HexColor('#374151')
            ),
            'CustomNormal': ParagraphStyle(
                'CustomNormal',
                parent=self.styles['Normal'],
                fontSize=10,
                alignment=TA_LEFT
            )
        }

    def _serialize_data(self, objects):
        """Convert SQLAlchemy objects to serialized data"""
        serialized = []
        for obj in objects:
            if hasattr(obj, 'serialize'):
                serialized.append(obj.serialize())
            else:
                # Fallback for objects without serialize method
                serialized.append(obj.__dict__)
        return serialized

    def export_tickets_pdf(self, tickets_data, filename="tickets_export"):
        """Export tickets data to PDF format"""
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from datetime import datetime
        import io

        # Serialize the data if needed
        if tickets_data and not isinstance(tickets_data[0], dict):
            tickets_data = self._serialize_data(tickets_data)

        # Create a file-like buffer to receive PDF data
        buffer = io.BytesIO()

        # Create the PDF object, using the buffer as its "file"
        doc = SimpleDocTemplate(
            buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)

        # Container for the 'Flowable' objects
        elements = []

        # Title
        title = Paragraph("Reporte de Tickets",
                          self.custom_styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 20))

        # Date
        date_str = datetime.now().strftime("%d/%m/%Y %H:%M")
        date_para = Paragraph(
            f"Generado el: {date_str}", self.custom_styles['CustomNormal'])
        elements.append(date_para)
        elements.append(Spacer(1, 20))

        # Summary
        total_tickets = len(tickets_data)
        open_tickets = len(
            [t for t in tickets_data if t.get('status') == 'open'])
        resolved_tickets = len(
            [t for t in tickets_data if t.get('status') == 'resolved'])

        summary_data = [
            ['Total de Tickets', str(total_tickets)],
            ['Tickets Abiertos', str(open_tickets)],
            ['Tickets Resueltos', str(resolved_tickets)]
        ]

        summary_table = Table(summary_data, colWidths=[3*inch, 1*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
        ]))

        elements.append(summary_table)
        elements.append(Spacer(1, 30))

        # Tickets table
        if tickets_data:
            # Table headers
            table_data = [['ID', 'Título', 'Estado',
                           'Prioridad', 'Solicitante', 'Fecha']]

            # Table rows
            for ticket in tickets_data:
                created_date = 'N/A'
                if ticket.get('created_at'):
                    try:
                        if isinstance(ticket['created_at'], str):
                            created_date = datetime.fromisoformat(
                                ticket['created_at'].replace('Z', '+00:00')).strftime('%d/%m/%Y')
                        else:
                            created_date = ticket['created_at'].strftime(
                                '%d/%m/%Y')
                    except:
                        created_date = 'N/A'

                row = [
                    str(ticket.get('id', '')),
                    ticket.get('title', '')[
                        :40] + ('...' if len(ticket.get('title', '')) > 40 else ''),
                    ticket.get('status', '').title(),
                    ticket.get('priority', '').title(),
                    ticket.get('requester_name', 'N/A'),
                    created_date
                ]
                table_data.append(row)

            # Create table
            tickets_table = Table(table_data, colWidths=[
                                  0.5*inch, 2.5*inch, 1*inch, 1*inch, 1.5*inch, 1*inch])
            tickets_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1),
                 [colors.white, colors.HexColor('#f8fafc')])
            ]))

            elements.append(tickets_table)

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return buffer

    def export_tickets_excel(self, tickets_data, filename="tickets_export"):
        """Export tickets to Excel"""
        # Serialize the data if needed
        if tickets_data and not isinstance(tickets_data[0], dict):
            tickets_data = self._serialize_data(tickets_data)

        # Prepare data for DataFrame
        excel_data = []
        for ticket in tickets_data:
            created_date = 'N/A'
            updated_date = 'N/A'

            if ticket.get('created_at'):
                try:
                    if isinstance(ticket['created_at'], str):
                        created_date = datetime.fromisoformat(
                            ticket['created_at'].replace('Z', '+00:00')).strftime('%d/%m/%Y %H:%M')
                    else:
                        created_date = ticket['created_at'].strftime(
                            '%d/%m/%Y %H:%M')
                except:
                    created_date = 'N/A'

            if ticket.get('updated_at'):
                try:
                    if isinstance(ticket['updated_at'], str):
                        updated_date = datetime.fromisoformat(
                            ticket['updated_at'].replace('Z', '+00:00')).strftime('%d/%m/%Y %H:%M')
                    else:
                        updated_date = ticket['updated_at'].strftime(
                            '%d/%m/%Y %H:%M')
                except:
                    updated_date = 'N/A'

            excel_data.append({
                'ID': ticket.get('id', ''),
                'Título': ticket.get('title', ''),
                'Descripción': ticket.get('description', ''),
                'Estado': ticket.get('status', '').title(),
                'Prioridad': ticket.get('priority', '').title(),
                'Solicitante': ticket.get('requester_name', ''),
                'Email Solicitante': ticket.get('requester_email', ''),
                'Asignado a': ticket.get('assigned_to', 'Sin asignar'),
                'Fecha Creación': created_date,
                'Última Actualización': updated_date
            })

        # Create DataFrame
        df = pd.DataFrame(excel_data)

        # Create Excel file in memory
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Tickets', index=False)

            # Get the workbook and worksheet objects
            workbook = writer.book
            worksheet = writer.sheets['Tickets']

            # Apply formatting
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width

        buffer.seek(0)
        return buffer

    def export_matrices_pdf(self, matrices_data, filename="matrices_export"):
        """Export matrices data to PDF format"""
        # Serialize the data if needed
        if matrices_data and not isinstance(matrices_data[0], dict):
            matrices_data = self._serialize_data(matrices_data)
        """Export matrices to PDF"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)

        elements = []

        # Title
        title = Paragraph("Reporte de Matrices de Análisis",
                          self.custom_styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 20))

        # Date
        date_str = datetime.now().strftime("%d/%m/%Y %H:%M")
        date_para = Paragraph(
            f"Generado el: {date_str}", self.custom_styles['CustomNormal'])
        elements.append(date_para)
        elements.append(Spacer(1, 20))

        # Summary
        total_matrices = len(matrices_data)
        matrix_types = {}
        for matrix in matrices_data:
            matrix_type = matrix.get('matrix_type', 'custom')
            matrix_types[matrix_type] = matrix_types.get(matrix_type, 0) + 1

        summary_data = [['Total de Matrices', str(total_matrices)]]
        for matrix_type, count in matrix_types.items():
            summary_data.append([f'Tipo: {matrix_type.upper()}', str(count)])

        summary_table = Table(summary_data, colWidths=[3*inch, 1*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
        ]))

        elements.append(summary_table)
        elements.append(Spacer(1, 30))

        # Individual matrices
        for matrix in matrices_data:
            # Matrix title
            matrix_title = Paragraph(
                f"Matriz: {matrix.get('name', 'Sin nombre')}", self.custom_styles['CustomHeading'])
            elements.append(matrix_title)

            # Matrix info
            info_data = [
                ['Tipo', matrix.get('matrix_type', 'custom').upper()],
                ['Descripción', matrix.get('description', 'Sin descripción')[
                    :100] + ('...' if len(matrix.get('description', '')) > 100 else '')],
                ['Dimensiones',
                    f"{matrix.get('rows', 0)} x {matrix.get('columns', 0)}"],
                ['Fecha Creación', datetime.fromisoformat(matrix['created_at'].replace(
                    'Z', '+00:00')).strftime('%d/%m/%Y') if matrix.get('created_at') else 'N/A']
            ]

            info_table = Table(info_data, colWidths=[1.5*inch, 4*inch])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
            ]))

            elements.append(info_table)
            elements.append(Spacer(1, 15))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return buffer

    def export_matrices_excel(self, matrices_data, filename="matrices_export"):
        """Export matrices data to Excel format"""
        # Serialize the data if needed
        if matrices_data and not isinstance(matrices_data[0], dict):
            matrices_data = self._serialize_data(matrices_data)
        """Export matrices to Excel"""
        # Prepare data for DataFrame
        excel_data = []
        for matrix in matrices_data:
            created_date = datetime.fromisoformat(matrix['created_at'].replace(
                'Z', '+00:00')).strftime('%d/%m/%Y %H:%M') if matrix.get('created_at') else 'N/A'
            updated_date = datetime.fromisoformat(matrix['updated_at'].replace(
                'Z', '+00:00')).strftime('%d/%m/%Y %H:%M') if matrix.get('updated_at') else 'N/A'

            excel_data.append({
                'ID': matrix.get('id', ''),
                'Nombre': matrix.get('name', ''),
                'Tipo': matrix.get('matrix_type', '').upper(),
                'Descripción': matrix.get('description', ''),
                'Filas': matrix.get('rows', 0),
                'Columnas': matrix.get('columns', 0),
                'Fecha Creación': created_date,
                'Última Actualización': updated_date
            })

        # Create DataFrame
        df = pd.DataFrame(excel_data)

        # Create Excel file in memory
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Matrices', index=False)

            # Get the workbook and worksheet objects
            workbook = writer.book
            worksheet = writer.sheets['Matrices']

            # Apply formatting
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width

        buffer.seek(0)
        return buffer

    def export_journal_pdf(self, journal_data, filename="journal_export"):
        """Export journal data to PDF format"""
        # Serialize the data if needed
        if journal_data and not isinstance(journal_data[0], dict):
            journal_data = self._serialize_data(journal_data)
        """Export journal entries to PDF"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)

        elements = []

        # Title
        title = Paragraph("Reporte de Bitácora",
                          self.custom_styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 20))

        # Date
        date_str = datetime.now().strftime("%d/%m/%Y %H:%M")
        date_para = Paragraph(
            f"Generado el: {date_str}", self.custom_styles['CustomNormal'])
        elements.append(date_para)
        elements.append(Spacer(1, 20))

        # Summary
        total_entries = len(journal_data)
        total_hours = sum(entry.get('hours_worked', 0)
                          or 0 for entry in journal_data)
        categories = {}
        statuses = {}

        for entry in journal_data:
            category = entry.get('category', 'work')
            status = entry.get('status', 'pending')
            categories[category] = categories.get(category, 0) + 1
            statuses[status] = statuses.get(status, 0) + 1

        summary_data = [
            ['Total de Entradas', str(total_entries)],
            ['Total de Horas', f"{total_hours:.1f}h"],
            ['Entradas Completadas', str(statuses.get('completed', 0))],
            ['Entradas Pendientes', str(statuses.get('pending', 0))]
        ]

        summary_table = Table(summary_data, colWidths=[3*inch, 1*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
        ]))

        elements.append(summary_table)
        elements.append(Spacer(1, 30))

        # Journal entries
        for entry in journal_data:
            # Entry title
            entry_title = Paragraph(
                f"Entrada: {entry.get('title', 'Sin título')}", self.custom_styles['CustomHeading'])
            elements.append(entry_title)

            # Entry details
            entry_date = datetime.fromisoformat(entry['entry_date'].replace(
                'Z', '+00:00')).strftime('%d/%m/%Y %H:%M') if entry.get('entry_date') else 'N/A'

            details_data = [
                ['Fecha', entry_date],
                ['Categoría', entry.get('category', 'work').title()],
                ['Estado', entry.get('status', 'pending').title()],
                ['Prioridad', entry.get('priority', 'medium').title()],
                ['Horas', f"{entry.get('hours_worked', 0) or 0}h"],
                ['Ubicación', entry.get('location', 'N/A')]
            ]

            details_table = Table(details_data, colWidths=[1.5*inch, 4*inch])
            details_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
            ]))

            elements.append(details_table)

            # Entry content
            if entry.get('content'):
                content_para = Paragraph(
                    f"<b>Contenido:</b><br/>{entry.get('content', '')[:300]}{'...' if len(entry.get('content', '')) > 300 else ''}", self.custom_styles['CustomNormal'])
                elements.append(Spacer(1, 10))
                elements.append(content_para)

            elements.append(Spacer(1, 20))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return buffer

    def export_journal_excel(self, journal_data, filename="journal_export"):
        """Export journal data to Excel format"""
        # Serialize the data if needed
        if journal_data and not isinstance(journal_data[0], dict):
            journal_data = self._serialize_data(journal_data)
        """Export journal entries to Excel"""
        # Prepare data for DataFrame
        excel_data = []
        for entry in journal_data:
            entry_date = datetime.fromisoformat(entry['entry_date'].replace(
                'Z', '+00:00')).strftime('%d/%m/%Y %H:%M') if entry.get('entry_date') else 'N/A'
            created_date = datetime.fromisoformat(entry['created_at'].replace(
                'Z', '+00:00')).strftime('%d/%m/%Y %H:%M') if entry.get('created_at') else 'N/A'

            excel_data.append({
                'ID': entry.get('id', ''),
                'Título': entry.get('title', ''),
                'Contenido': entry.get('content', ''),
                'Fecha Entrada': entry_date,
                'Categoría': entry.get('category', '').title(),
                'Prioridad': entry.get('priority', '').title(),
                'Estado': entry.get('status', '').title(),
                'Horas Trabajadas': entry.get('hours_worked', 0) or 0,
                'Ubicación': entry.get('location', ''),
                'Tags': ', '.join(entry.get('tags', [])) if entry.get('tags') else '',
                'Fecha Creación': created_date
            })

        # Create DataFrame
        df = pd.DataFrame(excel_data)

        # Create Excel file in memory
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Bitácora', index=False)

            # Get the workbook and worksheet objects
            workbook = writer.book
            worksheet = writer.sheets['Bitácora']

            # Apply formatting
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width

        buffer.seek(0)
        return buffer


# Create global instance
export_manager = ExportManager()
