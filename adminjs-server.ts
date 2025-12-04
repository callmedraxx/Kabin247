/**
 * AdminJS Server
 * Modern web-based database admin panel
 * Access at: http://localhost:3001/admin
 */

import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import AdminJSSequelize from '@adminjs/sequelize'
import express from 'express'
import { Sequelize, DataTypes, QueryTypes } from 'sequelize'
import { config } from 'dotenv'

// Load environment variables
config()

// Register Sequelize adapter
AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
})

// Read database config from .env
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'app',
}

const startAdminJS = async () => {
  // Create Sequelize connection
  const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: false, // We'll handle timestamps manually
    },
  })

  // Test connection
  try {
    await sequelize.authenticate()
    console.log('✅ Connected to MySQL database')
  } catch (error) {
    console.error('❌ Failed to connect to MySQL:', error)
    process.exit(1)
  }

  // Auto-discover tables and create models
  const tablesResult: any = await sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${dbConfig.database}' AND TABLE_TYPE = 'BASE TABLE'`,
    {
      type: QueryTypes.SELECT,
    }
  )

  // Sequelize SELECT queries return results directly as an array
  let tables: Array<{ TABLE_NAME: string }> = []
  
  if (Array.isArray(tablesResult)) {
    // Check if it's a tuple [results, metadata] or just results
    if (tablesResult.length === 2 && Array.isArray(tablesResult[0])) {
      tables = tablesResult[0]
    } else {
      tables = tablesResult
    }
  }

  console.log(`📊 Found ${tables.length} tables in database`)
  
  if (tables.length === 0) {
    console.log('⚠️  No tables found. Make sure your database has tables.')
    console.log(`   Database: ${dbConfig.database}`)
  } else {
    console.log(`   Tables: ${tables.map(t => t.TABLE_NAME).join(', ')}`)
  }

  // Create Sequelize models for each table dynamically
  const models: Record<string, any> = {}
  
  for (const table of tables) {
    const tableName = table.TABLE_NAME
    
    // Get column information
    const columnsResult: any = await sequelize.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = '${dbConfig.database}' AND TABLE_NAME = '${tableName}'
       ORDER BY ORDINAL_POSITION`,
      {
        type: QueryTypes.SELECT,
      }
    )

    // Handle both array and tuple return formats
    let columns: Array<{
      COLUMN_NAME: string
      DATA_TYPE: string
      IS_NULLABLE: string
      COLUMN_KEY: string
      COLUMN_DEFAULT: string | null
    }> = []
    
    if (Array.isArray(columnsResult)) {
      if (columnsResult.length === 2 && Array.isArray(columnsResult[0])) {
        columns = columnsResult[0]
      } else {
        columns = columnsResult
      }
    }

    // Build model definition
    const attributes: Record<string, any> = {}
    
    for (const col of columns) {
      const isPrimaryKey = col.COLUMN_KEY === 'PRI'
      const allowNull = col.IS_NULLABLE === 'YES'
      
      let type: any
      switch (col.DATA_TYPE) {
        case 'int':
        case 'tinyint':
        case 'smallint':
        case 'mediumint':
        case 'bigint':
          type = DataTypes.INTEGER
          break
        case 'decimal':
        case 'numeric':
        case 'float':
        case 'double':
          type = DataTypes.DECIMAL
          break
        case 'varchar':
        case 'char':
        case 'text':
        case 'tinytext':
        case 'mediumtext':
        case 'longtext':
          type = DataTypes.TEXT
          break
        case 'datetime':
        case 'timestamp':
          type = DataTypes.DATE
          break
        case 'json':
          type = DataTypes.JSON
          break
        case 'boolean':
        case 'bool':
          type = DataTypes.BOOLEAN
          break
        default:
          type = DataTypes.STRING
      }

      attributes[col.COLUMN_NAME] = {
        type,
        primaryKey: isPrimaryKey,
        allowNull,
        defaultValue: col.COLUMN_DEFAULT,
      }
    }

    // Create model
    models[tableName] = sequelize.define(tableName, attributes, {
      tableName,
      timestamps: false,
      freezeTableName: true,
    })
  }

  console.log(`✅ Created ${Object.keys(models).length} models`)

  // Create AdminJS instance with all models as resources
  const resources = Object.keys(models).map(tableName => ({
    resource: models[tableName],
    options: {
      listProperties: Object.keys(models[tableName].rawAttributes).slice(0, 10), // Show first 10 columns
    },
  }))

  const adminJs = new AdminJS({
    databases: [sequelize],
    resources: resources,
    rootPath: '/admin',
    branding: {
      companyName: 'Kabin247 Database Admin',
      logo: false,
      favicon: '',
    },
    locale: {
      language: 'en',
      translations: {
        labels: {
          loginWelcome: 'Welcome to Kabin247 Database Admin',
        },
      },
    },
  })

  // Initialize AdminJS and wait for assets to be ready
  await adminJs.initialize()

  // Build router (no authentication for local development)
  const router = AdminJSExpress.buildRouter(adminJs)

  // Create Express app
  const app = express()

  // Redirect root path to /admin
  app.get('/', (_req, res) => {
    res.redirect('/admin')
  })

  // Use AdminJS router
  app.use(adminJs.options.rootPath, router)

  // Health check endpoint
  app.get('/health', async (_req, res) => {
    try {
      await sequelize.authenticate()
      res.json({ status: 'ok', database: 'connected' })
    } catch (error: any) {
      res.status(500).json({ status: 'error', error: error.message })
    }
  })

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
      console.error('AdminJS Error:', err.message)
      if (!res.headersSent) {
        res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
      }
    }
    next()
  })

  // Start server
  const PORT = process.env.ADMINJS_PORT || 3001
  app.listen(PORT, () => {
    console.log('\n🎨 AdminJS is running!')
    console.log(`🌐 Access at: http://localhost:${PORT}/admin`)
    console.log(`📊 Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`)
    console.log(`\n✨ Modern web-based database admin ready!\n`)
  })

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await sequelize.close()
    process.exit(0)
  })
}

startAdminJS().catch(console.error)
