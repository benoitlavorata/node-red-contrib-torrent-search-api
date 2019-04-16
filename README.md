# node-red-contrib-clearbit
Provide nodes to call clearbit API.

## clearbit-config node
Add your api key for clearbit

## clearbit-execute node
Execute api calls according to documentation. 
In msg.payload, provide 3 props:
- resource
- method
- args


## Example
Input format should be:
```json
{
    payload: {
        resource: "Enrichment",
        method: "find",
        args: {
            email: "someone@example.com", 
            stream: true
        }
    }
}
```

Output msg.payload contains the result of your query.