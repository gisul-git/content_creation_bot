/**
 * Utilities for exporting chats to different formats.
 */
import jsPDF from 'jspdf';
import { Chat } from '@/types/chat';

export const exportUtils = {
  /**
   * Export chat as plain text file.
   */
  exportAsTxt(chat: Chat) {
    let content = `Chat: ${chat.title}\n`;
    content += `Date: ${new Date(chat.createdAt).toLocaleString()}\n`;
    content += `Last Updated: ${new Date(chat.updatedAt).toLocaleString()}\n\n`;
    content += '='.repeat(50) + '\n\n';
    
    chat.messages.forEach((msg, idx) => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      content += `[${idx + 1}] ${msg.role.toUpperCase()} (${timestamp}):\n`;
      content += `${msg.content}\n\n`;
      if (msg.file_url) {
        content += `[File attached: ${msg.file_url}]\n\n`;
      }
      content += '-'.repeat(50) + '\n\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${chat.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.txt`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Export chat as PDF file.
   */
  exportAsPdf(chat: Chat) {
    const pdf = new jsPDF();
    let y = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pdf.internal.pageSize.width - (margin * 2);
    
    // Title
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    const titleLines = pdf.splitTextToSize(chat.title, maxWidth);
    pdf.text(titleLines, margin, y);
    y += titleLines.length * 8 + 5;
    
    // Date
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(128, 128, 128);
    const dateStr = `Created: ${new Date(chat.createdAt).toLocaleString()} | Updated: ${new Date(chat.updatedAt).toLocaleString()}`;
    pdf.text(dateStr, margin, y);
    y += 10;
    pdf.setTextColor(0, 0, 0);
    
    // Separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pdf.internal.pageSize.width - margin, y);
    y += 10;
    
    // Messages
    pdf.setFontSize(11);
    chat.messages.forEach((msg, idx) => {
      // Check if we need a new page
      if (y > pageHeight - 40) {
        pdf.addPage();
        y = 20;
      }
      
      // Message number and role
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(10);
      const roleText = `${idx + 1}. ${msg.role.toUpperCase()}`;
      pdf.text(roleText, margin, y);
      y += 6;
      
      // Timestamp
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      const timestamp = new Date(msg.timestamp).toLocaleString();
      pdf.text(timestamp, margin + 2, y);
      y += 5;
      pdf.setTextColor(0, 0, 0);
      
      // Content
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      const contentLines = pdf.splitTextToSize(msg.content, maxWidth - 4);
      pdf.text(contentLines, margin + 4, y);
      y += contentLines.length * 5 + 3;
      
      // File attachment info
      if (msg.file_url) {
        pdf.setFontSize(9);
        pdf.setTextColor(0, 100, 200);
        pdf.text(`📎 File: ${msg.file_url}`, margin + 4, y);
        y += 5;
        pdf.setTextColor(0, 0, 0);
      }
      
      // Reactions
      if (msg.reactions && msg.reactions.length > 0) {
        pdf.setFontSize(9);
        pdf.text(`Reactions: ${msg.reactions.join(' ')}`, margin + 4, y);
        y += 5;
      }
      
      y += 5; // Space between messages
      
      // Add separator line
      if (idx < chat.messages.length - 1) {
        pdf.setDrawColor(230, 230, 230);
        pdf.line(margin, y, pdf.internal.pageSize.width - margin, y);
        y += 5;
      }
    });
    
    // Save PDF
    const fileName = `${chat.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    pdf.save(fileName);
  }
};

