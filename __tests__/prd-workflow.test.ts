/**
 * End-to-End Test for Complete PRD Workflow
 *
 * This test simulates the entire user journey:
 * 1. Start a new chat conversation
 * 2. Answer conversational PRD questions
 * 3. Generate PRD sections (title, problem statement, objectives, etc.)
 * 4. Publish the PRD
 * 5. Verify data persistence in database
 * 6. Verify published PRD view displays all tabs correctly
 */

describe('PRD Workflow E2E Test', () => {
  const BASE_URL = 'http://localhost:3000';
  let prdId: string;

  beforeAll(async () => {
    // Verify server is running
    const response = await fetch(`${BASE_URL}/api/chat`);
    expect(response.status).toBe(200);
  });

  describe('1. Chat Conversation Flow', () => {
    it('should start a new conversation', async () => {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'enhanced user rating system',
          conversationHistory: [],
        }),
      });

      const data = await response.json();
      console.log('✓ Initial response:', {
        success: data.success,
        hasContent: !!data.message?.content,
        role: data.message?.role,
      });

      expect(data.success).toBe(true);
      expect(data.message.role).toBe('assistant');
      expect(data.message.content).toBeDefined();
      // Initial message is an acknowledgment, questions come in follow-up messages
    });

    it('should generate title section after first answer', async () => {
      const conversationHistory = [
        {
          role: 'user',
          content: 'enhanced user rating system',
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: 'Welcome! [QUESTION]\nWhat\'s the main idea behind this feature?\n[OPTIONS]\n- Add new capability\n[/OPTIONS]\n[/QUESTION]',
          timestamp: new Date().toISOString(),
        },
      ];

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Improve existing feature - add categories and tags for detailed feedback',
          conversationHistory,
        }),
      });

      const data = await response.json();
      console.log('✓ After first answer:', {
        success: data.success,
        contentLength: data.message?.content?.length || 0,
        hasTitleSection: data.message?.content?.includes('[PRD_SECTION:title]'),
      });

      expect(data.success).toBe(true);
      expect(data.message.content).toContain('[PRD_SECTION:title]');
      expect(data.message.content).toContain('[/PRD_SECTION]');
    });

    it('should ask problem statement question', async () => {
      const conversationHistory = [
        {
          role: 'user',
          content: 'enhanced user rating system',
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: '[PRD_SECTION:title]\n# Enhanced User Rating System\n[/PRD_SECTION]\n\n[QUESTION]\nWhat problem are we solving?\n[OPTIONS]\n- Low response rate\n[/OPTIONS]\n[/QUESTION]',
          timestamp: new Date().toISOString(),
        },
      ];

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Low response rate, Lack of detailed feedback',
          conversationHistory,
        }),
      });

      const data = await response.json();
      console.log('✓ After problem answer:', {
        success: data.success,
        hasProblemSection: data.message?.content?.includes('[PRD_SECTION:problem_statement]'),
      });

      expect(data.success).toBe(true);
      expect(data.message.content).toContain('[PRD_SECTION:problem_statement]');
    });
  });

  describe('2. PRD Creation and Publishing', () => {
    it('should create PRD with sections', async () => {
      const sections = {
        title: '# Enhanced User Rating System',
        problem_statement: '## Problem\n- Low response rate\n- Lack of detailed feedback',
        objective: '## Objectives\n- Increase rating submissions\n- Improve feedback quality',
        user_stories_personas: '## Users\n- All post-trip users',
        goals_success_metrics: '## Metrics\n- Rating submission rate\n- Average categories selected',
        functional_requirements: '## Requirements\n- Multi-category rating\n- Tag system\n- Free-text comments',
      };

      const response = await fetch(`${BASE_URL}/api/prds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Enhanced User Rating System',
          content: Object.values(sections).join('\n\n'),
          sections,
          template: 'Standard PRD',
          status: 'draft',
        }),
      });

      const data = await response.json();
      console.log('✓ PRD created:', {
        success: data.success,
        id: data.data?.id?.substring(0, 8),
        hasSections: !!data.data?.sections,
        sectionsCount: data.data?.sections ? Object.keys(data.data.sections).length : 0,
      });

      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.sections).toBeDefined();
      expect(Object.keys(data.data.sections).length).toBeGreaterThanOrEqual(5);

      prdId = data.data.id;
    });

    it('should update PRD with additional sections', async () => {
      expect(prdId).toBeDefined();

      const updatedSections = {
        title: '# Enhanced User Rating System',
        problem_statement: '## Problem\n- Low response rate (<10%)\n- Lack of detailed feedback',
        objective: '## Objectives\n- Increase rating submissions by 40%\n- Improve feedback quality',
        user_stories_personas: '## Users\n- All post-trip users\n- Frequent travelers',
        goals_success_metrics: '## Metrics\n- Rating submission rate: 40%+\n- Average categories selected: 3+',
        functional_requirements: '## Requirements\n1. Multi-category rating system\n2. Tag-based feedback\n3. Free-text comments\n4. Sentiment analysis',
        technical_considerations: '## Technical\n- React Native\n- Works on 3G\n- Offline support',
      };

      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: updatedSections,
          content: Object.values(updatedSections).join('\n\n'),
        }),
      });

      const data = await response.json();
      console.log('✓ PRD updated:', {
        success: data.success,
        sectionsCount: data.data?.sections ? Object.keys(data.data.sections).length : 0,
      });

      expect(data.success).toBe(true);
      expect(Object.keys(data.data.sections).length).toBe(7);
    });
  });

  describe('3. Published PRD View Verification', () => {
    it('should fetch PRD by ID', async () => {
      expect(prdId).toBeDefined();

      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`);
      const data = await response.json();

      console.log('✓ PRD fetched:', {
        success: data.success,
        title: data.data?.title,
        sectionsCount: data.data?.sections ? Object.keys(data.data.sections).length : 0,
        sectionKeys: data.data?.sections ? Object.keys(data.data.sections) : [],
      });

      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Enhanced User Rating System');
      expect(data.data.sections).toBeDefined();
      expect(data.data.sections.title).toBeDefined();
      expect(data.data.sections.problem_statement).toBeDefined();
      expect(data.data.sections.functional_requirements).toBeDefined();
    });

    it('should have requirements data for REQUIREMENTS tab', async () => {
      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`);
      const data = await response.json();

      const requirements = data.data.sections.functional_requirements;
      console.log('✓ Requirements section:', {
        exists: !!requirements,
        length: requirements?.length || 0,
        preview: requirements?.substring(0, 100),
      });

      expect(requirements).toBeDefined();
      expect(requirements).toContain('Multi-category');
      expect(requirements).toContain('Tag');
      expect(requirements).toContain('Free-text');
    });

    it('should have research data for RESEARCH tab', async () => {
      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`);
      const data = await response.json();

      const problemStatement = data.data.sections.problem_statement;
      console.log('✓ Research (problem) section:', {
        exists: !!problemStatement,
        preview: problemStatement?.substring(0, 80),
      });

      expect(problemStatement).toBeDefined();
      expect(problemStatement).toContain('Low response rate');
      expect(problemStatement).toContain('detailed feedback');
    });

    it('should have metrics data for success tracking', async () => {
      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`);
      const data = await response.json();

      const metrics = data.data.sections.goals_success_metrics;
      console.log('✓ Metrics section:', {
        exists: !!metrics,
        preview: metrics?.substring(0, 80),
      });

      expect(metrics).toBeDefined();
      expect(metrics).toContain('40%');
      expect(metrics).toContain('categories');
    });
  });

  describe('4. Tab Population Verification', () => {
    it('should count requirements correctly', async () => {
      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`);
      const data = await response.json();

      const requirements = data.data.sections.functional_requirements;
      const requirementsList = requirements
        .split('\n')
        .filter((line: string) => line.match(/^\d+\.|\*|\-|•/))
        .filter((line: string) => line.trim().length > 0);

      console.log('✓ Requirements count:', {
        total: requirementsList.length,
        items: requirementsList.map((r: string) => r.substring(0, 50)),
      });

      expect(requirementsList.length).toBeGreaterThanOrEqual(4);
    });

    it('should have research items', async () => {
      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`);
      const data = await response.json();

      let researchCount = 0;
      if (data.data.sections.problem_statement) researchCount++;
      if (data.data.sections.context) researchCount++;
      if (data.data.sections.assumptions) researchCount++;

      console.log('✓ Research items count:', researchCount);

      expect(researchCount).toBeGreaterThanOrEqual(1);
    });

    it('should have technical considerations', async () => {
      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`);
      const data = await response.json();

      const technical = data.data.sections.technical_considerations;
      console.log('✓ Technical section:', {
        exists: !!technical,
        preview: technical?.substring(0, 60),
      });

      expect(technical).toBeDefined();
      expect(technical).toContain('React Native');
    });
  });

  describe('5. Cleanup', () => {
    it('should delete test PRD', async () => {
      expect(prdId).toBeDefined();

      const response = await fetch(`${BASE_URL}/api/prds/${prdId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('✓ PRD deleted:', { success: data.success });

      expect(data.success).toBe(true);
    });
  });
});
