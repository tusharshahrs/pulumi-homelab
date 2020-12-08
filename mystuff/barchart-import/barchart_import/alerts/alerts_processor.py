import logging
import tempfile

from google.cloud.pubsub_v1 import PublisherClient
from google.cloud.storage import Client
from pydantic import BaseModel

from barchart_import import logging_helper
from barchart_import.alerts import alert_parser

_logger = logging_helper.set_up_logger(__name__, log_level=logging.INFO)


class AlertsProcessor:

    alerts_output_topicname: str
    storage_client: Client
    pubsub_client: PublisherClient

    def __init__(self, alerts_output_topicname: str, gcp_project: str):
        self.alerts_output_topicname = alerts_output_topicname
        self.storage_client = Client(project=gcp_project)
        self.pubsub_client = PublisherClient(project=gcp_project)

    def process_objectstorage_file(self, bucket_name, object_name):
        _logger.info(f"Processing object {object_name} in bucket {bucket_name}")
        file_bucket = self.storage_client.get_bucket(bucket_name)
        blob = file_bucket.blob(object_name)
        _, temp_local_filename = tempfile.mkstemp()
        blob.download_to_filename(temp_local_filename)
        barchart_alerts = alert_parser.parse_file(temp_local_filename)
        alert_count = 0
        for barchart_alert in barchart_alerts:
            future = self.pubsub_client.publish(
                self.alerts_output_topicname,
                barchart_alert.json().encode("UTF-8"),
                source=f"{bucket_name}/{object_name}",
                index=alert_count,
            )
            message_id = future.result()
            _logger.debug(
                f"Processed alert in {object_name} in bucket {bucket_name}at index {alert_count}. Published message on {self.alerts_output_topicname} with id {message_id}"
            )
            alert_count += 1
