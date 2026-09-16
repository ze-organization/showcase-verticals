using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Data.Items;
using Sitecore.Events;
using Sitecore.Diagnostics;

namespace XmCloudNextJsStarter.Events
{
    public class FixEscapedXmlFields
    {
        public string ContentRootPath { get; set; }

        private static readonly string[] XmlFieldTypes = new[]
        {
            "Image",
            "General Link",
            "General Link with Search"
        };

        /// <summary>
        /// Thread-static flag to prevent re-entry when we save the item.
        /// Replaces EventDisabler which was suppressing the DB write.
        /// </summary>
        [ThreadStatic]
        private static bool _isProcessing;

        public void OnItemSaved(object sender, EventArgs args)
        {
            if (_isProcessing) return;

            try
            {
                Log.Info("[FixEscapedXmlFields] >>> METHOD ENTERED <<<", this);

                var item = Event.ExtractParameter<Item>(args, 0);
                if (item == null) return;

                Log.Info(
                    $"[FixEscapedXmlFields] Processing: '{item.Name}' " +
                    $"Path: '{item.Paths.FullPath}' DB: '{item.Database.Name}'",
                    this);

                if (!string.IsNullOrEmpty(ContentRootPath)
                    && !item.Paths.FullPath.StartsWith(ContentRootPath, StringComparison.OrdinalIgnoreCase))
                {
                    return;
                }

                if (item.Database.Name == "core") return;

                var fieldsToFix = new Dictionary<string, string>();
                item.Fields.ReadAll();

                foreach (Sitecore.Data.Fields.Field field in item.Fields)
                {
                    if (field.Name.StartsWith("__")) continue;

                    if (!XmlFieldTypes.Any(t => t.Equals(field.Type, StringComparison.OrdinalIgnoreCase)))
                        continue;

                    string originalValue = field.Value;
                    if (string.IsNullOrEmpty(originalValue)) continue;

                    string cleanedValue = CleanEscapedQuotes(originalValue);

                    if (cleanedValue != originalValue)
                    {
                        fieldsToFix[field.Name] = cleanedValue;
                        Log.Info(
                            $"[FixEscapedXmlFields] WILL FIX '{field.Name}': " +
                            $"'{originalValue}' -> '{cleanedValue}'",
                            this);
                    }
                }

                if (fieldsToFix.Count == 0) return;

                _isProcessing = true;
                try
                {
                    using (new Sitecore.SecurityModel.SecurityDisabler())
                    {
                        item.Editing.BeginEdit();
                        Log.Info("[FixEscapedXmlFields] BeginEdit called", this);

                        foreach (var fix in fieldsToFix)
                        {
                            item[fix.Key] = fix.Value;
                        }

                        item.Editing.EndEdit();
                        Log.Info("[FixEscapedXmlFields] EndEdit called", this);

                        // Verify
                        var freshItem = item.Database.GetItem(item.ID, item.Language, item.Version);
                        if (freshItem != null)
                        {
                            foreach (var fix in fieldsToFix)
                            {
                                string verifyValue = freshItem[fix.Key];
                                Log.Info(
                                    $"[FixEscapedXmlFields] VERIFY '{fix.Key}': '{verifyValue}'",
                                    this);
                            }
                        }
                    }
                }
                finally
                {
                    _isProcessing = false;
                }
                Log.Info($"[FixEscapedXmlFields] DONE '{item.Name}'", this);
            }
            catch (Exception ex)
            {
                _isProcessing = false;
                Log.Error($"[FixEscapedXmlFields] ERROR: {ex.Message}", ex, this);
            }
        }

        private string CleanEscapedQuotes(string value)
        {
            if (string.IsNullOrEmpty(value)) return value;

            string result = value;

            string backslashQuote = new string(new char[] { '\\', '"' });
            if (result.IndexOf(backslashQuote, StringComparison.Ordinal) >= 0)
            {
                result = result.Replace(backslashQuote, "\"");
            }

            result = result.Replace("&amp;quot;", "\"");
            result = result.Replace("&quot;", "\"");
            result = result.Replace("&#34;", "\"");
            result = result.Replace("\\u0022", "\"");

            return result;
        }
    }
}