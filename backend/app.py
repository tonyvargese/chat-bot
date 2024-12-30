from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import errors  
from flask_cors import CORS 

app = Flask(__name__)

CORS(app)


# Database connection setup
def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',  # Use your MySQL username
        password='root',  # Use your MySQL password
        database='chatbot_project'  # Your database name
    )
    return connection

# API route to process user queries
@app.route('/query', methods=['POST'])
def query():
    try:
        user_query = request.json.get('query')  # Extract the user's chatbot query
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
            return jsonify({"error": "No relevant requirements found for your query."})

        # Fetch and return the results
        result = cursor.fetchall()
        return jsonify(result)  # Send results back to the frontend

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        if connection:
            connection.close()
# Endpoint to fetch clients
@app.route('/clients', methods=['GET'])
def get_clients():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT client_id, client_name FROM Clients;")
        clients = cursor.fetchall()
        return jsonify(clients)
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        if connection:
            connection.close()

# Endpoint to fetch modules
@app.route('/modules', methods=['GET'])
def get_modules():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT module_id, module_name FROM Modules;")
        modules = cursor.fetchall()
        return jsonify(modules)
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        if connection:
            connection.close()

# Endpoint to fetch requirements based on client and module
@app.route('/requirements', methods=['POST'])
def get_requirements():
    try:
        data = request.json
        client_name = data.get('client_name')
        module_name = data.get('module_name')

        if not client_name or not module_name:
            return jsonify({"error": "Both client_name and module_name are required."}), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Fetch requirements based on client and module
        query = """
            SELECT process_area, requirement_description
            FROM Requirements
            WHERE client_name = %s AND module_name = %s;
        """
        cursor.execute(query, (client_name, module_name))
        requirements = cursor.fetchall()

        return jsonify(requirements)
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        if connection:
            connection.close()



# Test connection route
@app.route('/test_connection')
def test_connection():
    try:
        # Try connecting to the database
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Try running a simple query, like fetching the current date/time or a simple select
        cursor.execute('SELECT NOW();')
        
        # Fetch the result of the query
        result = cursor.fetchone()
        
        # Close the cursor and connection
        cursor.close()
        connection.close()
        
        # If successful, return the current date/time from the database
        return f"Database connected! Current time is {result[0]}"
    except mysql.connector.Error as err:
        return f"Error: {err}"








if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask app in debug mode
