import plotly.express as px
import pandas as pd

df = pd.DataFrame([
    dict(Task="Teams Installation", Start='2025-01-01', Finish='2025-3-1', Resource="Teams Install"),
    dict(Task="Training", Start='2025-03-05', Finish='2025-05-15', Resource="Training"),
    dict(Task="Cisco Decom", Start='2025-09-20', Finish='2025-11-30', Resource="Decom")
])

fig = px.timeline(df, x_start="Start", x_end="Finish", y="Task", color="Resource")
fig.update_yaxes(autorange="reversed")
fig.show()