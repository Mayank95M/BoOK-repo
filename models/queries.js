const pool = require('./db')

const queries = {
    async getUserByUsername(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0]; // Return the first row (user object)
    },
    
      async getUserById(id) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0]; // Return the first row (user object)
    },
    async getNeedCategories(){
        const result = await pool.query('SELECT * FROM categories');
        return result.rows;
    },
    async getNeedCategories(){
        const result = await pool.query('SELECT * FROM categories');
        return result.rows;
    },

    async getNeedCategoryById(id){
        const result = await pool.query('SELECT * FROM categories WHERE id = $1',[id]);
        return result.rows[0];
    },

    async getNeedById(id){
        const result = await pool.query('SELECT * FROM subcategories WHERE id = $1',[id]);
        return result.rows[0];
    },

    async getNeedsByNeedCategory(categoryId){
        const result = await pool.query('SELECT * FROM subcategories WHERE category_id = $1',[categoryId]);
        return result.rows
    },
    //Search & Filter methods, Design Frameworks, Guidelines, Glossary, Courses, Project Database, Discussion Forum, Submit Your Methods
    async getUseMethods() {
        return [
            { id: 1, name: 'Search & Filter methods', description: 'Description for Method 1' },
            { id: 2, name: 'Design Frameworks', description: 'Description for Method 2' },
            { id: 3, name: 'Guidelines', description: 'Description for Method 3' },
            { id: 4, name: 'Glossary', description: 'Description for Method 4' },
            { id: 5, name: 'Courses', description: 'Description for Method 5' },
            { id: 6, name: 'Project Database', description: 'Description for Method 6' },
            { id: 7, name: 'Discussion Forum', description: 'Description for Method 7' },
            { id: 8, name: 'Submit Your Methods', description: 'Description for Method 8' }
        ];
    },

    async getSolutions(subcategoryId){
        const result = await pool.query(
            'SELECT * FROM solutions WHERE subcategory_id = $1',
            [subcategoryId]
        );
        return result.rows;
    },

    async getSolutionById(id){
        const result = await pool.query('SELECT * FROM solutions WHERE id = $1',[id]);
        return result.rows[0]
    },

    async addNeed(categoryId,name){
        const result = await pool.query('INSERT INTO subcategories (category_id,name) VALUES ($1,$2) RETURNING *',
            [categoryId,name]
        );

        return result.rows[0];
    },

    async updateNeed(id, name) {
        const result = await pool.query(
            'UPDATE subcategories SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        return result.rows[0];
    },

    async deleteNeed(id) {
        await pool.query('DELETE FROM solutions WHERE subcategory_id = $1', [id]);
        await pool.query('DELETE FROM subcategories WHERE id = $1', [id]);
        // const client = await pool.connect();
        // try {
        //     await client.query('BEGIN');
        //     // First delete all solutions associated with this subcategory
        //     await client.query('DELETE FROM solutions WHERE subcategory_id = $1', [id]);
        //     // Then delete the subcategory
        //     await client.query('DELETE FROM subcategories WHERE id = $1', [id]);
        //     await client.query('COMMIT');
        // } catch (err) {
        //     await client.query('ROLLBACK');
        //     throw err;
        // } finally {
        //     client.release();
        // }
    },

    async addSolution(subcategoryId, content) {
        const maxOrder = await pool.query(
            'SELECT COALESCE(MAX(display_order), 0) as max_order FROM solutions WHERE subcategory_id = $1',
            [subcategoryId]
        );
        const newOrder = maxOrder.rows[0].max_order + 1;
        
        const result = await pool.query(
            'INSERT INTO solutions (subcategory_id, content, display_order) VALUES ($1, $2, $3) RETURNING *',
            [subcategoryId, content, newOrder]
        );
        return result.rows[0];
    },

    async updateSolution(id, content) {
        const result = await pool.query(
            'UPDATE solutions SET content = $1 WHERE id = $2 RETURNING *',
            [content, id]
        );
        return result.rows[0];
    },

    async deleteSolution(id) {
        await pool.query('DELETE FROM solutions WHERE id = $1', [id]);
    },

    async addNeedWithSolutions(categoryId, subcategoryName, solutions) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Insert subcategory
            const subcategoryResult = await client.query(
                'INSERT INTO subcategories (category_id, name) VALUES ($1, $2) RETURNING id',
                [categoryId, subcategoryName]
            );
            
            const subcategoryId = subcategoryResult.rows[0].id;
            
            // Insert solutions
            for (let i = 0; i < solutions.length; i++) {
                await client.query(
                    'INSERT INTO solutions (subcategory_id, content, display_order) VALUES ($1, $2, $3)',
                    [subcategoryId, solutions[i], i + 1]
                );
            }
            
            await client.query('COMMIT');
            return { success: true, subcategoryId };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = queries;