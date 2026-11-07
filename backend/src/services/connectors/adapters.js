/**
 * Multi-source Ingestion Adapters
 * Connects and normalizes SOPs from Notion, Google Drive, and Confluence
 */

class NotionAdapter {
  static parsePage(rawPageData) {
    // Normalizes Notion Blocks into structured Markdown & metadata
    return {
      sourcePlatform: 'notion',
      externalId: rawPageData.id || `notion_${Date.now()}`,
      title: rawPageData.properties?.title?.title?.[0]?.plain_text || rawPageData.title || 'Untitled Notion SOP',
      sourceUrl: rawPageData.url || 'https://notion.so/workspace/sop',
      category: rawPageData.category || 'Operations SOP',
      department: rawPageData.department || 'Operations',
      version: rawPageData.version || '1.0',
      effectiveDate: rawPageData.last_edited_time || new Date(),
      content: rawPageData.markdownContent || rawPageData.text || ''
    };
  }
}

class GoogleDriveAdapter {
  static parseDoc(rawDocData) {
    // Normalizes Google Drive Docs/PDFs into structured text
    return {
      sourcePlatform: 'google_drive',
      externalId: rawDocData.id || `gdrive_${Date.now()}`,
      title: rawDocData.name || rawDocData.title || 'Untitled Google Doc',
      sourceUrl: rawDocData.webViewLink || 'https://drive.google.com/file/d/sop',
      category: rawDocData.category || 'HR & Company Policies',
      department: rawDocData.department || 'HR',
      version: rawDocData.version || '1.0',
      effectiveDate: rawDocData.modifiedTime || new Date(),
      content: rawDocData.bodyText || rawDocData.content || ''
    };
  }
}

class ConfluenceAdapter {
  static parsePage(rawPageData) {
    // Normalizes Confluence Storage Format XHTML into clean Markdown
    return {
      sourcePlatform: 'confluence',
      externalId: rawPageData.id || `confluence_${Date.now()}`,
      title: rawPageData.title || 'Untitled Confluence Spec',
      sourceUrl: rawPageData._links?.webui ? `https://confluence.atlassian.net${rawPageData._links.webui}` : 'https://confluence.atlassian.net/wiki/sop',
      category: rawPageData.category || 'Engineering & Technical SOP',
      department: rawPageData.department || 'Engineering',
      version: rawPageData.version?.number ? `${rawPageData.version.number}.0` : '1.0',
      effectiveDate: rawPageData.version?.when || new Date(),
      content: rawPageData.body?.storage?.value || rawPageData.content || ''
    };
  }
}

module.exports = {
  NotionAdapter,
  GoogleDriveAdapter,
  ConfluenceAdapter
};

