const pool = require('./db');

const designQueries = {

  async getAllDesignMethods() {
    const result = await pool.query('SELECT * FROM design_methods ORDER BY title');
    return result.rows;
  },

  async getDesignById(id) {
    const result = await pool.query('SELECT * FROM design_methods WHERE id=$1', [id]);
    return result.rows[0];
  },

  async getDesignBySubcategoryId(id) {
    const result = await pool.query(
      `SELECT dm.id, dm.title, dm.document
       FROM design_methods dm
       INNER JOIN subcategory_design_methods sdm
       ON dm.id = sdm.design_method_id
       WHERE sdm.subcategory_id = $1`, [id]
    );
    return result.rows;
  },

  async getAvailableDesignMethods(id) {
    const result = await pool.query(
      `SELECT * FROM design_methods
       WHERE id NOT IN (
         SELECT design_method_id
         FROM subcategory_design_methods
         WHERE subcategory_id = $1
       )`, [id]
    );
    return result.rows;
  },

  async getAllUseMethods() {
    return [
      { id: 1, title: 'Search & Filter methods' },
      { id: 2, title: 'Design frameworks' },
      { id: 3, title: 'Guidelines' },
      { id: 4, title: 'Glossary' },
      { id: 5, title: 'Courses' },
      { id: 6, title: 'Project Database' },
      { id: 7, title: 'Discussion Forum' },
      { id: 8, title: 'Submit Your Methods' }
    ];
  },

  async addDesignMethod(title, document) {
    const result = await pool.query(
      'INSERT INTO design_methods (title, document) VALUES ($1, $2) RETURNING id',
      [title, document]
    );
    return result.rows[0];
  },

  async uptateDesignMethodWithFile(id, title, file) {
    const result = await pool.query(
      'UPDATE design_methods SET title = $1, document = $2 WHERE id = $3 RETURNING id',
      [title, file, id]
    );
    return result.rows[0];
  },

  async uptateDesignMethodWithoutFile(id, title) {
    const result = await pool.query(
      'UPDATE design_methods SET title = $1 WHERE id = $2 RETURNING id',
      [title, id]
    );
    return result.rows[0];
  },

  async deleteDesignMethod(id) {
    const result = await pool.query('DELETE FROM design_methods WHERE id = $1', [id]);
    return result;
  },

  async attachDesignMethodToSubcategory(subcategoryId, methodId) {
    const result = await pool.query(
      'INSERT INTO subcategory_design_methods (subcategory_id, design_method_id) VALUES ($1, $2)',
      [subcategoryId, methodId]
    );
    return result.rows[0];
  },

  async removeDesignMethodFromSubcategory(subcategoryId, methodId) {
    const result = await pool.query(
      'DELETE FROM subcategory_design_methods WHERE subcategory_id = $1 AND design_method_id = $2',
      [subcategoryId, methodId]
    );
    console.log('reached here');
  },

  // ✅ ADDED: Search method names for client-side fuzzy search
  async getAllSearchableDesignMethods() {
    const result = await pool.query(
      'SELECT id, title AS name FROM design_methods ORDER BY title'
    );
    return result.rows;
  }

};

module.exports = designQueries;
