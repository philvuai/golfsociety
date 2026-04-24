import React from 'react';
import styled from 'styled-components';
import { Download, FileText } from 'lucide-react';
import { Event } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${p => p.theme.colors.status.info};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #4338ca; transform: translateY(-1px); }
`;

function escapeCsvValue(val: string | number): string {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(events: Event[]) {
  const csvRows = [
    ["Name", "Date", "Location", "Status", "Total Players", "Surplus"].map(escapeCsvValue),
    ...events.map(event => [
      escapeCsvValue(event.name || 'Untitled Event'),
      escapeCsvValue(new Date(event.date).toLocaleDateString('en-GB')),
      escapeCsvValue(event.location || 'TBD'),
      escapeCsvValue(event.status || 'unknown'),
      escapeCsvValue((event.playerCount || 0) + (event.playerCount2 || 0)),
      escapeCsvValue(`£${(event.surplus || 0).toFixed(2)}`)
    ])
  ];

  const csvContent = "data:text/csv;charset=utf-8,"
    + csvRows.map(r => r.join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `golf_events_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportToPDF(events: Event[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Golf Society Events Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [['Name', 'Date', 'Location', 'Status', 'Players', 'Surplus']],
    body: events.map(event => [
      event.name || 'Untitled Event',
      new Date(event.date).toLocaleDateString('en-GB'),
      event.location || 'TBD',
      event.status || 'unknown',
      (event.playerCount || 0) + (event.playerCount2 || 0),
      `£${(event.surplus || 0).toFixed(2)}`
    ]),
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' }
  });

  doc.save(`golf_events_${new Date().toISOString().split('T')[0]}.pdf`);
}

interface ExportActionsProps {
  events: Event[];
}

const ExportActions: React.FC<ExportActionsProps> = ({ events }) => {
  return (
    <Container>
      <ActionButton onClick={() => exportToCSV(events)}>
        <Download size={16} /> Export CSV
      </ActionButton>
      <ActionButton onClick={() => exportToPDF(events)}>
        <FileText size={16} /> Export PDF
      </ActionButton>
    </Container>
  );
};

export default ExportActions;
