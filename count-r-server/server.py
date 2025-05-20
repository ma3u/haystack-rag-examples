from mcp.server.fastmcp import FastMCP
import signal
import time

# Configuration variables
MCP_NAME = "count-r"
MCP_HOST = "127.0.0.1"  # if you run it locally
MCP_PORT = 5000         # default port
MCP_TIMEOUT = 30        # 30s timeout

# handle SIGINT (Ctrl+C) for gracefully shutdown
def signal_handler(sig, frame):
    print("\nShutting down server...")
    exit(0)
signal.signal(signal.SIGINT, signal_handler)

# create an MCP server with increased timeout
mcp = FastMCP(
    name=MCP_NAME,
    host=MCP_HOST,
    timeout=MCP_TIMEOUT,
    port=MCP_PORT
)

# define our mcp tool
@mcp.tool() 
def count_r(word:str) -> int:
    """ Count the number of 'r' letters in the given word """
    try:
        # add robust error handling
        if not isinstance(word, str):
            raise ValueError("Input must be a string")
        # count the numbers of lower and upper 'r' letters
        return word.count("r") + word.count("R")
    except Exception as e:
        # return 0 if an error occurs
        return str(e)

if __name__ == "__main__":
    # start the server and add a error handling
    try:
        # get mcp hostname
        print(f"Starting MCP server '{MCP_NAME}' on {MCP_HOST}:{MCP_PORT}")
        mcp.run()
    except Exception as e:
        print(f"Error: {e}")
        # sleep before exit to give time to show error message
        time.sleep(5)
        exit(1) # exit with error