from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
import pandas as pd

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',  
        password='root', 
        database='chatbot_project'  
    )
    return connection


class RequirementsRequest(BaseModel):
    client_name: str
    module_name: str


@app.post("/query", summary="Process user query", description="Fetches requirements based on user query keywords.")
async def query(request: Request):
    try:
        data = await request.json()
        user_query = data.get("query")

        if not user_query:
            raise HTTPException(status_code=400, detail="Query is required.")

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        
        if "medicaid"  in user_query.lower():
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
        df = pd.DataFrame(result)
        
        return df.to_dict(orient='records')
        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if connection:
            connection.close()


@app.get("/clients",description='Endpoint to fetch clients')
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


@app.get("/modules",description='Endpoint to fetch modules')
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


@app.post("/requirements",description='Endpoint to fetch requirements based on client and module')
async def get_requirements(req: RequirementsRequest):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

       
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


@app.get("/test_connection",description='Test connection route')
async def test_connection():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        
        cursor.execute('SELECT NOW();')

        
        result = cursor.fetchone()

        return {"message": "Database connected!", "current_time": result[0]}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection error: {err}")
    finally:
        if connection:
            connection.close()
