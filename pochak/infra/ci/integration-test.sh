#!/bin/bash
set -e

echo "=== Pochak Integration Test ==="

# Wait for services to be healthy
echo "Checking service health..."

SERVICES=(
  "http://localhost:8080/health:Gateway"
  "http://localhost:8081/actuator/health:Identity"
  "http://localhost:8082/actuator/health:Content"
  "http://localhost:8083/actuator/health:Commerce"
  "http://localhost:8084/actuator/health:Operation"
  "http://localhost:8085/actuator/health:Admin"
)

for svc in "${SERVICES[@]}"; do
  IFS=':' read -r url name <<< "$svc"
  url="${svc%%:*}"
  name="${svc##*:}"
  echo -n "  $name... "
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    echo "OK"
  else
    echo "FAIL (HTTP $status)"
    FAILED=1
  fi
done

if [ -n "$FAILED" ]; then
  echo "Some services are not healthy. Aborting."
  exit 1
fi

echo ""
echo "=== API Smoke Tests ==="

# Test 1: Home endpoint (public, no auth needed)
echo -n "  GET /api/v1/home... "
status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/v1/home")
[ "$status" = "200" ] && echo "OK ($status)" || echo "FAIL ($status)"

# Test 2: Sports endpoint (public)
echo -n "  GET /api/v1/sports... "
status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/v1/sports")
[ "$status" = "200" ] && echo "OK ($status)" || echo "FAIL ($status)"

# Test 3: Products endpoint (public)
echo -n "  GET /api/v1/products... "
status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/v1/products")
[ "$status" = "200" ] && echo "OK ($status)" || echo "FAIL ($status)"

# Test 4: Auth login (should return 400/401, not 404)
echo -n "  POST /api/v1/auth/login (expect 400/401)... "
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -d '{}')
[ "$status" = "400" ] || [ "$status" = "401" ] && echo "OK ($status)" || echo "FAIL ($status)"

# Test 5: Protected endpoint without auth (should return 401)
echo -n "  GET /api/v1/users/me (expect 401)... "
status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/v1/users/me")
[ "$status" = "401" ] && echo "OK ($status)" || echo "FAIL ($status)"

# Test 6: Venues endpoint (public)
echo -n "  GET /api/v1/venues... "
status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/v1/venues")
[ "$status" = "200" ] && echo "OK ($status)" || echo "FAIL ($status)"

# Test 7: Schedule endpoint (public)
echo -n "  GET /api/v1/schedule/today... "
status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/v1/schedule/today")
[ "$status" = "200" ] && echo "OK ($status)" || echo "FAIL ($status)"

echo ""
echo "=== Integration tests completed ==="
