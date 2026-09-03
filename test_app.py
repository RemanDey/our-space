import unittest

from app import app


class OurSpaceFeatureTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_shared_todo_round_trip(self):
        response = self.client.get("/api/todos")
        self.assertEqual(response.status_code, 200)
        todos = response.get_json()
        self.assertIsInstance(todos, list)

        response = self.client.post("/api/todos", json={"text": "Buy flowers"})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["ok"])
        self.assertEqual(data["todo"]["text"], "Buy flowers")
        self.assertFalse(data["todo"]["done"])

    def test_events_endpoint_returns_multiple_dates(self):
        response = self.client.get("/api/events")
        self.assertEqual(response.status_code, 200)
        events = response.get_json()
        self.assertGreater(len(events), 1)
        self.assertIn("title", events[0])
        self.assertIn("date", events[0])

    def test_gift_endpoint_accepts_virtual_gifts(self):
        response = self.client.post(
            "/api/gifts",
            json={"gift": "🌹", "message": "For your next smile"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["ok"])
        self.assertEqual(data["gift"]["emoji"], "🌹")


if __name__ == "__main__":
    unittest.main()
