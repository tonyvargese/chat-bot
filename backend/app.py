from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection setup
def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',  # Use your MySQL username
        password='root',  # Use your MySQL password
        database='chatbot_project'  # Your database name
    )
    return connection

# Request schema for requirements API
class RequirementsRequest(BaseModel):
    client_name: str
    module_name: str

# API route to process user queries
@app.post("/query")
async def query(request: Request):
    try:
        data = await request.json()
        user_query = data.get("query")

        if not user_query:
            raise HTTPException(status_code=400, detail="Query is required.")

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Process the query to identify keywords
        if "medicaid" in user_query.lower():
            cursor.execute("""
                SELECT requirement_id, process_area, requirement_description 
                FROM Requirements 
                WHERE module_name = 'Medicaid';
            """)
        elif "customer" in user_query.lower():
            cursor.execute("""
                SELECT requirement_id, process_area, requirement_description 
                FROM Requirements 
                WHERE module_name = 'Customer';
            """)
        elif "t-bill" in user_query.lower() or "treasury" in user_query.lower():
            cursor.execute("""
                SELECT requirement_id, process_area, requirement_description 
                FROM Requirements 
                WHERE module_name = 'T-Bill Rates';
            """)
        else:
            raise HTTPException(status_code=404, detail="No relevant requirements found for your query.")

        result = cursor.fetchall()
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if connection:
            connection.close()

# Endpoint to fetch clients
@app.get("/clients")
async def get_clients():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT client_id, client_name FROM Clients;")
        clients = cursor.fetchall()
        return clients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection:
            connection.close()

# Endpoint to fetch modules
@app.get("/modules")
async def get_modules():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT module_id, module_name FROM Modules;")
        modules = cursor.fetchall()
        return modules
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection:
            connection.close()

# Endpoint to fetch requirements based on client and module
@app.post("/requirements")
async def get_requirements(req: RequirementsRequest):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Fetch requirements based on client and module
        query = """
            SELECT process_area, requirement_description
            FROM Requirements
            WHERE client_name = %s AND module_name = %s;
        """
        cursor.execute(query, (req.client_name, req.module_name))
        requirements = cursor.fetchall()

        return requirements
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection:
            connection.close()

# Test connection route
@app.get("/test_connection")
async def test_connection():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Try running a simple query, like fetching the current date/time or a simple select
        cursor.execute('SELECT NOW();')

        # Fetch the result of the query
        result = cursor.fetchone()

        return {"message": "Database connected!", "current_time": result[0]}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection error: {err}")
    finally:
        if connection:
            connection.close()
