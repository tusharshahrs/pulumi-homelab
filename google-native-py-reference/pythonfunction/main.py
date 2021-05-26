def handler(request):
    headers = { 'Content-Type': 'text/plain'}
    return ('Hello from Pulumi World!',200, headers)