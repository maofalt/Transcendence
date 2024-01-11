from django.utils.deprecation import MiddlewareMixin

class PathPrefixMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Strip the prefix from the request path
        prefix = '/api/tournament'
        if request.path.startswith(prefix):
            request.path_info = request.path[len(prefix):]

    def process_response(self, request, response):
        # Prepend the prefix to absolute URLs in the response
        prefix = request.META.get('HTTPS_X_FORWARDED_PREFIX', '')
        if prefix and hasattr(response, 'url'):
            response['Location'] = prefix + response.url
        return response